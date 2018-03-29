/* @flow */
/*::

import type { UpdateProgressBar } from "./console/progress-bar";

export type WebpackStats = {
  chunks?: Array<WebpackChunk>,
  modules: Array<WebpackModule>
};

export type WebpackChunk = {
  modules: Array<WebpackModule>
};

export type WebpackModule = {
 id: string,
 name: string,
 size: string,
 reasons: Array<WebpackReason>
};

export type WebpackReason = {
  module: string,
  moduleName: string,
  loc: string,
  type: string,
};

export type PreModule = {
  id: string,
  name: string,
  clearName: string,
  type: string,
  reasons: Array<WebpackReason>,
  size: string,
  location: string,
};

export type Module = {
  name: string,
  clearName: string,
  imported: number,
  type: string,
  depsType: string,
  reasons: Array<Reason>,
  locations: Array<string>,
  filesIncluded: Array<string>,
  depsChains: Array<Array<string>>
};

export type Reason = {
  clearName: string,
  type: string,
  module?: string,
  moduleName: string,
  loc: string,
  importType: string,
  reasons: Array<SubReason>
};

export type SubReason = {
  moduleName: string,
  loc: string,
  importType: string,
}
*/

const path = require("path");
const mm = require("micromatch");

const DEFAULT_IGNORE = ["multi *", "*-loader*"];

const toArray = (report /*: { [string]: Module } */) =>
  Object.keys(report).map(name =>
    Object.assign({}, report[name], { name: name })
  );

const getModuleName = (identifier /*: string */) => {
  const path = identifier.split("node_modules/").pop();
  if (!path || path === identifier) return "";
  if (path.startsWith("@")) {
    const [ns, name] = path.split("/");
    return `${ns}/${name}`;
  }
  const [name] = path.split("/");
  return name;
};

const getLocation = (fullPath /*: string */, name /*: string*/) => {
  const locationSplitPoint = fullPath.indexOf(name);
  const location = fullPath.substr(0, locationSplitPoint + name.length + 1);
  return location.split("!").pop(); // loaders!!!
};

const getModuleType = (name /*: string */) =>
  name.startsWith("multi ") ? "entry" : isNodeModules(name) ? "module" : "file";

const flattenChunks = (stats /*: WebpackStats */) /*: Array<WebpackModule> */ =>
  stats.chunks
    ? stats.chunks.reduce((modules, chunk) => modules.concat(chunk.modules), [])
    : stats.modules;

const isNodeModules = (identifier /*: string */) =>
  identifier.indexOf("node_modules") > -1;

const joinModules = (modules) /*: { [string]: Module } */ =>
  modules.reduce((acc, module /*: PreModule */) => {
    if (module.type === "file") {
      const joined = acc[module.name] || {
        type: module.type,
        imported: 0,
        reasons: [],
        depsChains: []
      };

      joined.imported += module.reasons.length;
      joined.reasons = joined.reasons.concat(
        module.reasons.map(reason => ({
          moduleName: reason.moduleName,
          loc: reason.loc,
          type: getModuleType(reason.moduleName),
          importType: reason.type
        }))
      );

      acc[module.name] = joined;
    } else {
      const joined = acc[module.clearName] || {
        imported: 0,
        type: module.type,
        depsType: "unknown",
        reasons: [],
        locations: [],
        filesIncluded: [],
        depsChains: []
      };
      const reasons /*: Array<Reason> */ = module.reasons.reduce(
        (acc, reason) => {
          const clearName = getModuleName(reason.moduleName);
          const location = clearName
            ? getLocation(reason.moduleName, clearName)
            : "";
          const type = getModuleType(reason.moduleName);

          if (location === module.location) return acc;
          joined.imported += 1;

          if (type === "file") {
            acc.push({
              type,
              clearName,
              moduleName: reason.moduleName,
              loc: reason.loc,
              importType: reason.type,
              reasons: []
            });
          } else {
            const subReason /*: SubReason */ = {
              moduleName: reason.moduleName,
              importType: reason.type,
              loc: reason.loc
            };

            const existingReason = joined.reasons.find(
              reason => reason.clearName === clearName
            );

            if (existingReason) {
              existingReason.reasons.push(subReason);
            } else {
              acc.push({
                type,
                clearName,
                moduleName: reason.moduleName,
                importType: reason.type,
                reasons: [subReason],
                loc: reason.loc
              });
            }
          }

          return acc;
        },
        []
      );

      joined.reasons = joined.reasons.concat(reasons);
      joined.depsType = joined.reasons.some(reason => reason.type === "file")
        ? "direct"
        : "transitive";
      joined.locations.push(module.location);
      joined.filesIncluded.push(module.name);

      acc[module.clearName] = joined;
    }

    return acc;
  }, {});

const pickFromModules = (modules) /*: Array<PreModule> */ =>
  modules.map(module => {
    const clearName = getModuleName(module.name);
    return {
      clearName,
      id: module.id,
      type: getModuleType(module.name),
      name: module.name,
      location: clearName ? getLocation(module.name, clearName) : "",
      size: module.size,
      reasons: module.reasons
    };
  });

const buildModuleDepsChains = (modules, name) => {
  const module = modules[name];
  return module.reasons.reduce((acc, reason) => {
    if (name === reason.clearName) {
      return acc;
    }

    if (reason.type !== "module" || !modules[reason.clearName]) {
      return acc;
    }

    if (modules[reason.clearName].depsType === "direct") {
      acc.push([reason.clearName]);
      return acc;
    }

    buildModuleDepsChains(modules, reason.clearName).forEach(nested => {
      acc.push([reason.clearName].concat(nested));
    });

    return acc;
  }, []);
};

const postProcessModules = (modules, ignore, updateProgressBar) => {
  const total = Object.keys(modules).length;
  return Object.keys(modules).reduce((acc, name, index) => {
    updateProgressBar(total, index, "processing", name);

    if (mm.isMatch(name, ignore)) {
      return acc;
    }

    const module = modules[name];
    if (module.type === "module") {
      module.locations = Array.from(new Set(module.locations));
      module.filesIncluded = Array.from(new Set(module.filesIncluded));
    }

    if (module.type === "module" && module.depsType === "transitive") {
      const depsChains = buildModuleDepsChains(modules, name);
      module.depsChains = Array.from(
        new Set(depsChains.map(chain => chain.join("|")))
      ).map(chain => chain.split("|"));
    }

    module.reasons = module.reasons.filter(
      reason => !mm.isMatch(reason.clearName || reason.moduleName, ignore)
    );

    if (module.reasons.length) {
      acc[name] = module;
    }
    return acc;
  }, {});
};

module.exports = function analyze(
  stats /*: WebpackStats */,
  ignore /*: Array<string> */ = [],
  updateProgressBar /*: UpdateProgressBar */ = () => {}
) {
  const rawModules = flattenChunks(stats);
  const ignorePatterns = [].concat(DEFAULT_IGNORE).concat(ignore);
  const modules = pickFromModules(rawModules);
  const updateProgressBarWithTotal = (
    total /*: number */,
    cur /*: number */,
    title /*: string */,
    name /*: string */
  ) =>
    updateProgressBar({
      title,
      text: name,
      progress: Math.ceil(cur / total * 100)
    });
  return toArray(
    postProcessModules(
      joinModules(modules),
      ignorePatterns,
      updateProgressBarWithTotal
    )
  );
};

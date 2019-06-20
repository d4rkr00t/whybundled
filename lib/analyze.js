/* @flow */
/*::

import type { UpdateProgressBar } from "./console/progress-bar";

export type WebpackStats = {
  chunks?: Array<WebpackChunk>,
  modules: Array<WebpackModule>,
  children?: Array<WebpackStats & { id?: string }>
};

export type NormalizedWebpackStats = {
  chunks: Chunks,
  modules: Array<WebpackModule>,
};

export type WebpackChunk = {
  id: number,
  size: number,
  names: Array<string>,
  modules: Array<WebpackModule>
};

export type WebpackModule = {
 id: string,
 name: string,
 size: string,
 chunks: Array<number>,
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
  chunks: Array<number>,
  type: string,
  reasons: Array<WebpackReason>,
  size: string,
  deps: number,
  location: string,
};

export type Module = {
  name: string,
  size: number,
  chunks: Array<number>,
  clearName: string,
  imported: number,
  type: string,
  deps: number,
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

export type Chunks = {
  [key: number]: {
    id: number,
    size: number,
    names: Array<string>
  }
}
*/

const path = require("path");
const mm = require("micromatch");

const DEFAULT_IGNORE = ["multi *", "*-loader*"];

const toArray = (report /*: { [string]: Module } */) =>
  // $FlowFixMe
  Object.keys(report).map(name =>
    Object.assign({}, report[name], { name: name })
  );

const getModuleName = (identifier /*: string */) => {
  const path = (identifier || "").split("node_modules/").pop();
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

const getModuleType = (name /*?: string */) =>
  !name || name.startsWith("multi ")
    ? "entry"
    : isNodeModules(name)
    ? "module"
    : "file";

const isNodeModules = (identifier /*: string */) =>
  identifier.indexOf("node_modules") > -1;

const safeModuleSize = (size /*?: number */) => (size ? size : 0);

const joinModules = (modules) /*: { [string]: Module } */ =>
  modules.reduce((acc, module /*: PreModule */) => {
    if (module.type === "file") {
      const joined = acc[module.name] || {
        type: module.type,
        size: safeModuleSize(module.size),
        chunks: module.chunks,
        deps: 0,
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
        size: 0,
        depsType: "unknown",
        deps: 0,
        reasons: [],
        chunks: module.chunks,
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
      joined.size += safeModuleSize(module.size);
      joined.chunks = Array.from(new Set(joined.chunks.concat(module.chunks)));

      acc[module.clearName] = joined;
    }

    return acc;
  }, {});

const pickFromModules = (modules) /*: Array<PreModule> */ =>
  modules.filter(Boolean).map(module => {
    const clearName = getModuleName(module.name);
    return {
      clearName,
      id: module.id,
      type: getModuleType(module.name),
      name: module.name,
      location: clearName ? getLocation(module.name, clearName) : "",
      chunks: module.chunks,
      size: module.size,
      deps: 0,
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

const postProcessModules = (
  modules /*: { [key: string]: Module }*/,
  ignore /*: Array<string> */,
  updateProgressBar /*: Function */
) => {
  return Object.keys(modules).reduce((acc, name, index) => {
    updateProgressBar(index + 1, "processing", name);

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

    module.reasons.forEach(reason => {
      const mod = modules[reason.clearName] || modules[reason.moduleName];
      if (mod && mod.type === "module") {
        mod.deps += 1;
      }
    });

    if (!module.reasons.length) {
      acc[name] = module;
    } else {
      module.reasons = module.reasons.filter(
        reason =>
          !mm.isMatch(reason.clearName || reason.moduleName || "", ignore)
      );

      if (module.reasons.length) {
        acc[name] = module;
      }
    }

    return acc;
  }, {});
};

module.exports = function analyze(
  normalizedStats /*: NormalizedWebpackStats */,
  ignore /*: Array<string> */ = [],
  updateProgressBar /*: UpdateProgressBar */ = () => {}
) {
  const chunks = normalizedStats.chunks;
  const modules = pickFromModules(normalizedStats.modules);
  const ignorePatterns = [].concat(DEFAULT_IGNORE).concat(ignore);
  const joinedModules = joinModules(modules);
  const joinedModulesCount = Object.keys(joinedModules).length;
  const updateProgressBarWithTotal = (
    cur /*: number */,
    title /*: string */,
    name /*: string */
  ) =>
    updateProgressBar({
      title,
      text: name,
      progress: Math.ceil((cur / joinedModulesCount) * 100)
    });

  return {
    modules: toArray(
      postProcessModules(
        joinedModules,
        ignorePatterns,
        updateProgressBarWithTotal
      )
    ),
    chunks
  };
};

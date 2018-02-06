const path = require("path");

const getModuleName = identifier => {
  const path = identifier.split("node_modules/").pop();
  if (!path || path === identifier) return "";
  if (path.startsWith("@")) {
    const [ns, name] = path.split("/");
    return `${ns}/${name}`;
  }
  const [name] = path.split("/");
  return name;
};

const flattenChunks = stats =>
  stats.chunks.reduce((modules, chunk) => modules.concat(chunk.modules), []);

const isNodeModules = identifier => identifier.indexOf("node_modules") > -1;

const getAbsoultePath = statsPath =>
  path.isAbsolute(statsPath) ? statsPath : path.join(process.cwd(), statsPath);

const joinModules = modules =>
  modules.reduce((acc, module) => {
    const name = module.clearName || module.name;
    const isExternal = isNodeModules(module.name);
    acc[name] = acc[name] || {
      modules: [],
      external: isExternal,
      freq: 0,
      isDirect: isExternal ? false : true
    };
    acc[name].modules.push(module);
    acc[name].freq += module.reasons.length;

    if (isExternal && !acc[name].isDirect) {
      acc[name].isDirect = module.reasons.some(reason => !reason.external);
    }

    return acc;
  }, {});

const pickFromModules = modules =>
  modules.map(module => {
    const clearName = getModuleName(module.name);
    return {
      clearName,
      id: module.id,
      name: module.name,
      size: module.size,
      reasons: module.reasons.map(reason => {
        reason.clearName = getModuleName(reason.moduleName);
        reason.external = isNodeModules(reason.module);
        reason.internal = clearName === reason.clearName;
        return reason;
      })
    };
  });

module.exports = function analyze(statsPath, ignore) {
  const stats = require(getAbsoultePath(statsPath));
  const rawModules = flattenChunks(stats);
  const modules = pickFromModules(rawModules).filter(
    m => !m.name.startsWith("multi")
  );
  return joinModules(modules);
};

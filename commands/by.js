const mm = require("micromatch");
const { analyze, print, getStats } = require("../lib");

module.exports = function byCommand(statsFilePath, flags, pattern) {
  const stats = getStats(statsFilePath);
  const { by } = flags;
  const report = analyze(stats).filter(mod => {
    return (
      mod.reasons.some(
        reason => reason.moduleName === by || reason.clearName === by
      ) || (mod.depsChains || []).some(deps => deps.indexOf(by) !== -1)
    );
  });
  const limit = pattern ? 0 : flags.limit >= 0 ? flags.limit : 20;
  print(report, flags, limit);
};

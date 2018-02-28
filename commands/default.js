/* @flow */

const mm = require("micromatch");
const { analyze, print, getStats } = require("../lib");

/*::
type Flags = {
  limit: number,
  filesOnly?: boolean,
  modulesOnly?: boolean,
  directOnly?: boolean,
  transitiveOnly?: boolean,
  duplicatesOnly?: boolean,
  ignore?: string,
  by?: string
}
*/

module.exports = function defaultCommand(
  statsFilePath /*: string */,
  flags /*: Flags */,
  pattern /*: string*/
) {
  const stats = getStats(statsFilePath);
  const ignore = flags.ignore ? flags.ignore.split(",") : [];
  const report = analyze(stats, ignore).filter(module => {
    if (pattern && mm.isMatch(module.name, pattern)) {
      return true;
    } else if (pattern) {
      return false;
    }

    if (flags.filesOnly && module.type !== "file") return false;
    if (flags.modulesOnly && module.type !== "module") return false;

    if (flags.directOnly && module.depsType !== "direct") return false;
    if (flags.transitiveOnly && module.depsType !== "transitive") return false;
    if (flags.duplicatesOnly && (module.locations || []).length < 2)
      return false;

    return true;
  });

  const limit = pattern ? 0 : flags.limit >= 0 ? flags.limit : 20;
  print(report, flags, limit);
};

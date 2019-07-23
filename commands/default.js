/* @flow */

const mm = require("micromatch");
const { analyze, getStats } = require("../lib");
const validate = require("../lib/validate");
const { log, invalidStatsJson } = require("../lib/console/messages");
const normalizeStats = require("../lib/normalize-stats");

/*::
import type { UpdateProgressBar } from '../lib/console/progress-bar';
import type { Reporter } from '../lib/reporter';

type Flags = {
  limit: number,
  filesOnly?: boolean,
  modulesOnly?: boolean,
  directOnly?: boolean,
  transitiveOnly?: boolean,
  duplicatesOnly?: boolean,
  ignore?: string,
  by?: string,
  chunks?: string
}
*/

module.exports = function defaultCommand(
  statsFilePath /*: string */,
  flags /*: Flags */,
  pattern /*: string*/,
  reporter /*: Reporter */,
  updateProgressBar /*: UpdateProgressBar */ = () => {}
) {
  const stats = normalizeStats(getStats(statsFilePath));
  if (!validate(stats.modules)) {
    log(invalidStatsJson(statsFilePath));
    process.exit(1);
  }

  const ignore = flags.ignore ? flags.ignore.split(",") : [];
  const report = analyze(stats, ignore, updateProgressBar);

  let chunkIds;
  if (flags.chunks) {
    chunkIds = new Set();
    const chunks = flags.chunks.split(",");
    Object.keys(stats.chunks).forEach(id => {
      const chunk = stats.chunks[id];
      if (
        chunks.includes(chunk.id) ||
        (chunk.names && chunk.names.some(name => chunks.includes(name)))
      ) {
        chunkIds.add(chunk.id);
      }
    });
  }

  const format = str =>
    str.replace(/^\.\//, "").replace(/ \+ \d+ modules$/, "");

  const modules = report.modules.filter(module => {
    const matchesChunk = chunkIds
      ? module.chunks.some(chunk => chunkIds.has(chunk))
      : true;

    if (pattern && mm.isMatch(module.name, pattern, { format })) {
      return matchesChunk;
    } else if (pattern) {
      return false;
    }

    if (!matchesChunk) return false;

    if (flags.filesOnly && module.type !== "file") return false;
    if (flags.modulesOnly && module.type !== "module") return false;

    if (flags.directOnly && module.depsType !== "direct") return false;
    if (flags.transitiveOnly && module.depsType !== "transitive") return false;
    if (flags.duplicatesOnly && (module.locations || []).length < 2)
      return false;

    return true;
  });

  const limit = pattern ? 0 : flags.limit >= 0 ? flags.limit : 20;
  reporter.print(modules, report.chunks, flags, limit);
};

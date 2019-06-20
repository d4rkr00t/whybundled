/* @flow */

/*::
import type { UpdateProgressBar } from '../lib/console/progress-bar';
import type { Reason, Module } from '../lib/analyze';
import type { Reporter } from '../lib/reporter';
*/

const { analyze, getStats } = require("../lib");
const validate = require("../lib/validate");
const { log, invalidStatsJson } = require("../lib/console/messages");
const normalizeStats = require("../lib/normalize-stats");

const isDepsChainBy = (depsChain /*: Array<string> */, by /*: string */) => {
  return depsChain.indexOf(by) !== -1;
};

const modulesFollowingDepsChain = (
  modules /*: Array<Module> */,
  by /*:string*/
) =>
  modules.filter(
    mod =>
      mod.reasons.some(
        reason => reason.moduleName === by || reason.clearName === by
      ) || (mod.depsChains || []).some(deps => isDepsChainBy(deps, by))
  );

const isSingleReasonBy = (reasons /*: Array<Reason> */, by /*: string */) =>
  reasons.length === 1 &&
  (reasons[0].moduleName === by || reasons[0].clearName === by);

const modulesOnlyBy = (modules /*: Array<Module> */, by /*: string */) =>
  modulesFollowingDepsChain(modules, by).filter(
    mod =>
      isSingleReasonBy(mod.reasons, by) ||
      ((mod.depsChains || []).length &&
        (mod.depsChains || []).every(depsChain => isDepsChainBy(depsChain, by)))
  );

module.exports = function byCommand(
  statsFilePath /*: string */,
  flags /*: { limit: number, by: string, only?: boolean, ignore?: string } */,
  pattern /*: string */,
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

  const modules = flags.only
    ? modulesOnlyBy(report.modules, flags.by)
    : modulesFollowingDepsChain(report.modules, flags.by);

  const limit /*: number */ = pattern ? 0 : flags.limit >= 0 ? flags.limit : 20;
  reporter.print(modules, report.chunks, { by: flags.by }, limit);
};

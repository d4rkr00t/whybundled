import { Reason, Module } from "../lib/analyze";
import { reporter as defaultReporter } from "../lib/reporter";
import { createProgressBar } from "../lib/console/progress-bar";

import { analyze, getStats } from "../lib";
import { vlidateStatsJson } from "../lib/validate";
import { log, invalidStatsJson } from "../lib/console/messages";
import { normalizeStats } from "../lib/normalize-stats";
import { sortDefault } from "./common/sort-modules";

/**
 * Shows all modules that were brought into the bundle by a particular module.
 *
 * @param {string[]} $inputs
 * @param {number} [limit=20] Limits output of reasons and files
 * @param {boolean} only Limits output to only include modules that were included by specified module exclusively
 * @param {string} ignore Comma separated list of glob patterns to exclude modules from final output
 *
 * @usage {cliName} by stats.json [pattern]
 * @example whybundled by stats.json styled-components
 * @example whybundled by stats.json styled-components --ignore babel-runtime,tslib
 * @example whybundled by stats.json styled-components --only
 */
export default async function byCommand(
  $inputs: string[],
  limit: number = 20,
  only: boolean = false,
  ignore?: string
) {
  const start = Date.now();
  const [statsFilePath, by] = $inputs;
  const updateProgressBar = createProgressBar();

  const stats = normalizeStats(await getStats(statsFilePath));
  if (!vlidateStatsJson(stats.modules)) {
    log(invalidStatsJson(statsFilePath));
    process.exit(1);
  }

  const ignorePatterns = ignore ? ignore.split(",") : [];
  const report = analyze(stats, ignorePatterns, updateProgressBar);

  const modules = only
    ? modulesOnlyBy(report.modules, by)
    : modulesFollowingDepsChain(report.modules, by);

  sortDefault(modules);
  defaultReporter.print(modules, report.chunks, { by: by }, limit);

  const timing = (Date.now() - start) / 1000;
  const rounded = Math.round(timing * 100) / 100;

  console.log(`🏁  Done in ${rounded}s.`);
}

const isDepsChainBy = (depsChain: Array<string>, by: string) => {
  return depsChain.indexOf(by) !== -1;
};

const modulesFollowingDepsChain = (modules: Array<Module>, by: string) =>
  modules.filter(
    (mod) =>
      mod.reasons.some(
        (reason) => reason.moduleName === by || reason.clearName === by
      ) || (mod.depsChains || []).some((deps) => isDepsChainBy(deps, by))
  );

const isSingleReasonBy = (reasons: Array<Reason>, by: string) =>
  reasons.length === 1 &&
  (reasons[0].moduleName === by || reasons[0].clearName === by);

const modulesOnlyBy = (modules: Array<Module>, by: string) =>
  modulesFollowingDepsChain(modules, by).filter(
    (mod) =>
      isSingleReasonBy(mod.reasons, by) ||
      ((mod.depsChains || []).length &&
        (mod.depsChains || []).every((depsChain) =>
          isDepsChainBy(depsChain, by)
        ))
  );

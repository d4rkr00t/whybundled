import mm from "micromatch";
import { analyze, getStats } from "../lib";
import { vlidateStatsJson } from "../lib/validate";
import { log, invalidStatsJson } from "../lib/console/messages";
import { normalizeStats } from "../lib/normalize-stats";
import { reporter as defaultReporter } from "../lib/reporter";
import { createProgressBar } from "../lib/console/progress-bar";
import type { Module } from "../lib/analyze";
import { sortModules } from "./common/sort-modules";

/**
 * Whybundled – Why the hell is this module in a bundle?
 *
 * @param {string[]} $inputs
 * @param {number} [limit=20] Limits output of reasons and files
 * @param {boolean} filesOnly Only include files
 * @param {boolean} modulesOnly Only include modules
 * @param {boolean} directoryOnly Only include direct dependencies
 * @param {boolean} transitiveOnly Only include transitive dependencies
 * @param {boolean} duplicatesOnly Only include modules that have duplicates in a resulting bundle
 * @param {string} ignore Comma separated list of glob patterns to exclude modules from final output
 * @param {string} sortBy Sort modules, available fields: size, imported. E.g. size:asc or size:desc.
 *
 * @usage {cliName} stats.json [pattern]
 * @example whybundled stats.json --ignore babel-runtime,tslib
 * @example whybundled stats.json --modulesOnly
 * @example whybundled stats.json --sortBy size:asc
 * @example whybundled by stats.json styled-components
 */
export default async function defaultCommand(
  $inputs: string[],
  limit: number = 20,
  filesOnly?: boolean,
  modulesOnly?: boolean,
  directOnly?: boolean,
  transitiveOnly?: boolean,
  duplicatesOnly?: boolean,
  ignore?: string,
  sortBy?: string
) {
  const start = Date.now();
  const [statsFilePath, pattern] = $inputs;
  const updateProgressBar = createProgressBar();

  const stats = normalizeStats(await getStats(statsFilePath));
  if (!vlidateStatsJson(stats.modules)) {
    log(invalidStatsJson(statsFilePath));
    process.exit(1);
  }

  const ignorePatterns = ignore ? ignore.split(",") : [];
  const report = analyze(stats, ignorePatterns, updateProgressBar);

  const format = (str: string) =>
    str.replace(/^\.\//, "").replace(/ \+ \d+ modules$/, "");

  const modules = report.modules.filter((module) => {
    if (pattern && mm.isMatch(module.name, pattern, { format })) {
      return true;
    } else if (pattern) {
      return false;
    }

    if (filesOnly && module.type !== "file") return false;
    if (modulesOnly && module.type !== "module") return false;

    if (directOnly && module.depsType !== "direct") return false;
    if (transitiveOnly && module.depsType !== "transitive") return false;
    if (duplicatesOnly && (module.locations || []).length < 2) return false;

    return true;
  });

  const updatedLimit = pattern ? 0 : limit >= 0 ? limit : 20;
  const [sortKey, sortOrder] = (sortBy || "").split(":");
  sortModules(modules, sortKey, sortOrder);

  defaultReporter.print(modules, report.chunks, {}, updatedLimit);

  const timing = (Date.now() - start) / 1000;
  const rounded = Math.round(timing * 100) / 100;

  console.log(`🏁  Done in ${rounded}s.`);
}

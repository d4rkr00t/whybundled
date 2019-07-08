/* @flow */

const chalk = require("chalk");

module.exports = function help() {
  return [
    chalk.green("Usage"),
    `  $ whybundled stats.json "[pattern]"                   ${chalk.dim('[default command]')}`,
    `  $ whybundled stats.json --ignore babel-runtime,tslib  ${chalk.dim('[default command]')}`,
    `  $ whybundled stats.json --by styled-components        ${chalk.dim('[by command]')}`,
    "",
    chalk.green("Default options:"),
    `  ${chalk.yellow("[pattern]")}          Optional pattern used to filter output to only matched modules`,
    `                     Note: you might need to wrap the pattern in quotes to use wildcards, e.g. "*.jsx"`,
    `  ${chalk.yellow("--ignore")}           Comma separated list of glob pattern to exclude modules from final output`,
    `  ${chalk.yellow("--modulesOnly")}      Only include modules`,
    `  ${chalk.yellow("--filesOnly")}        Only include files`,
    `  ${chalk.yellow("--directOnly")}       Only include direct dependencies`,
    `  ${chalk.yellow("--transitiveOnly")}   Only include transitive dependencies`,
    `  ${chalk.yellow("--duplicatesOnly")}   Only include modules that have duplicates in a resulting bundle`,
    `  ${chalk.yellow("--limit")}            Limits output of reasons and files [default: 20]`,
    "",
    chalk.green("By options [--by]:"),
    `  ${chalk.yellow("--ignore")}           Comma separated list of glob pattern to exclude modules from final output`,
    `  ${chalk.yellow("--limit")}            Limits output of reasons and files [default: 20]`,
    `  ${chalk.yellow("--only")}             Limits output to only include modules that were included by specified module exclusively`,
    ``,
    chalk.green("Other options:"),
    `  ${chalk.yellow("-v, --version")}      Shows version.`,
    `  ${chalk.yellow("--help")}             Shows help.`,
    "",
    chalk.green("Examples"),
    "  $ whybundled stats.json --modulesOnly",
    "",
  ].join('\n');
}

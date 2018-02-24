const chalk = require("chalk");

module.exports = function help() {
  console.log([
    chalk.green("Usage"),
    `  $ whybundled stats.json [pattern]                 ${chalk.dim('[default command]')}`,
    `  $ whybundled stats.json --by styled-components    ${chalk.dim('[by command]')}`,
    "",
    chalk.green("Default options:"),
    `  ${chalk.yellow("[pattern]")}          Optional pattern used to filter output to only matched modules`,
    `  ${chalk.yellow("--modulesOnly")}      Only include modules`,
    `  ${chalk.yellow("--filesOnly")}        Only include files`,
    `  ${chalk.yellow("--directOnly")}       Only include direct dependencies`,
    `  ${chalk.yellow("--transitiveOnly")}   Only include transitive dependencies`,
    `  ${chalk.yellow("--duplicatesOnly")}   Only include modules that have duplicates in a resulting bundle`,
    "",
    chalk.green("By options:"),
    `  ${chalk.dim(`There aren't any options that can be combined with ${chalk.yellow('--by')} flag`)}`,
    ``,
    chalk.green("Other options:"),
    `  ${chalk.yellow("-v, --version")}      Shows version.`,
    `  ${chalk.yellow("--help")}             Shows help.`,
    "",
    chalk.green("Examples"),
    "  $ whybundled stats.json --modulesOnly",
    "",
  ].join('\n'));
}

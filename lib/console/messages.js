/* @flow */

const chalk = require("chalk");

function log(msg /*: Array<string> */) {
  console.log(msg.join("\n"));
}

function redBadge(label /*: string*/) {
  return chalk.bgRed.black(` ${label} `);
}

function errorBadge() {
  return redBadge("ERROR");
}

function invalidStatsJson(file /*: string */) {
  return [
    chalk.red(
      `${errorBadge()} Stats file ${chalk.bold(
        `"${file}"`
      )} doesn't contain "reasons" why modules are included...`
    ),
    "",
    `Whybundled needs "reasons" to function properly. To add them check webpack documentation: ${chalk.blue(
      "https://webpack.js.org/configuration/stats/#stats"
    )}`
  ];
}

module.exports = { log, invalidStatsJson };

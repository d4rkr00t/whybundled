import { bgRed, black, red, bold, blue } from "colorette";

export function log(msg: Array<string>) {
  console.log(msg.join("\n"));
}

function redBadge(label: string) {
  return bgRed(black(` ${label} `));
}

function errorBadge() {
  return redBadge("ERROR");
}

export function invalidStatsJson(file: string): Array<string> {
  return [
    red(
      `${errorBadge()} Stats file ${bold(
        `"${file}"`
      )} doesn't contain enough information...`
    ),
    "",
    `Issue is possibly with missing "reasons" in webpack module stats. To add them check webpack documentation: ${blue(
      "https://webpack.js.org/configuration/stats/#stats"
    )}`,
  ];
}

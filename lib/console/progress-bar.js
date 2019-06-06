/* @flow */

/*::
export type UpdateProgressBar = (param: { progress: number, title?: string, text?: string }) => void;
*/

const chalk = require("chalk");

function toStartOfLine(stdout /*: stream$Writable */) {
  stdout.write("\r");
}

function clearLine(stdout /*: stream$Writable */) {
  // $FlowFixMe: investigate process.stderr.columns flow error
  stdout.write(`\r${" ".repeat(stdout.columns)}`);
}

function selectPrevLine(stdout /*: stream$Writable */) {
  stdout.write("\x1b[1A");
}

module.exports = function createProgressBar(
  stdout /*: stream$Writable */ = process.stdout
) /*: UpdateProgressBar */ {
  return function updateProgress({
    progress,
    title: maybeTitle,
    text: maybeText
  }) {
    // $FlowFixMe: investigate process.stderr.columns flow error
    const columns /*: number */ = stdout.columns - 10;
    const ratio = progress / 100;
    const title = maybeTitle || "";
    const text = maybeText || "";

    const decorationsSize = "⸨⸩ • info: % …".length;
    const progressNumberSize = ("" + progress).length;
    const progressBarSize = 20;
    const availableSpace = Math.max(
      0,
      columns -
        decorationsSize -
        progressBarSize -
        progressNumberSize -
        title.length
    );
    const completeLength = Math.round(progressBarSize * ratio);
    const incompleteLength = progressBarSize - completeLength;

    const completed = chalk.inverse(" ").repeat(completeLength);
    const incompleted = "░".repeat(progressBarSize - completeLength);
    const infoLine =
      text.length > availableSpace
        ? text.substr(0, availableSpace) + "…"
        : text;

    clearLine(stdout);
    toStartOfLine(stdout);

    stdout.write(
      `⸨${completed}${incompleted}⸩ ${chalk.dim(
        `${progress}%`
      )} • ${chalk.green("info")} ${
        title ? chalk.magenta(`${title}: `) : ""
      }${infoLine}`
    );

    if (progress === 100) {
      toStartOfLine(stdout);
      clearLine(stdout);
    }
  };
};

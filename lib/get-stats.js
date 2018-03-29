/* @flow */

const path = require("path");
const fs = require("fs");

/*::
import type { WebpackStats } from './analyze';
*/

const getAbsoultePath = (filePath /*: string */) =>
  path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

module.exports = function getStats(
  statsFilePath /*: string */
) /*: WebpackStats */ {
  try {
    // $FlowFixMe
    const fileContent = fs.readFileSync(getAbsoultePath(statsFilePath), "utf8");
    const indexOfTheFirstBrace = fileContent.indexOf("{");
    const cleanContent = fileContent.substr(indexOfTheFirstBrace);
    try {
      return JSON.parse(cleanContent) /* as WebpackStats */;
    } catch (e) {
      throw new Error(`Stats file "${statsFilePath}" is not a valid json...`);
    }
  } catch (e) {
    throw new Error(`No stats file found in: ${statsFilePath}`);
  }
};

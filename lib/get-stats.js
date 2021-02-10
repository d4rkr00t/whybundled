/* @flow */

const path = require("path");
const fs = require("fs");
const { parseChunked } = require("@discoveryjs/json-ext");

/*::
import type { WebpackStats } from './analyze';
*/

const getAbsolutePath = (filePath /*: string */) =>
  path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

module.exports = async function getStats(
  statsFilePath /*: string */
) /*: Promise<WebpackStats> */ {
  try {
    const fileStream = fs.createReadStream(getAbsolutePath(statsFilePath), {
      encoding: "utf8",
      autoClose: true
    });
    try {
      return parseChunked(fileStream); /* as Promise<WebpackStats> */
    } catch (e) {
      throw new Error(`Stats file "${statsFilePath}" is not a valid json...`);
    }
  } catch (e) {
    throw new Error(`No stats file found in: ${statsFilePath}`);
  }
};

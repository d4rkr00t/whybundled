/* @flow */

const path = require("path");

/*::
import type { WebpackStats } from '../analyze';
*/

const getAbsoultePath = (filePath /*: string */) =>
  path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

module.exports = function getStats(
  statsFilePath /*: string */
) /*?: WebpackStats */ {
  try {
    // $FlowFixMe
    return require(getAbsoultePath(statsFilePath));
  } catch (e) {
    throw new Error(`No stats file found in: ${statsFilePath}`);
  }
};

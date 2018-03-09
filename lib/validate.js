/* @flow */

/*::
import type { WebpackStats } from "./analyze";
*/

function has(obj) {
  return function(prop) {
    return obj.hasOwnProperty(prop);
  };
}

function isValidModule(sample) {
  const isProp = has(sample);
  if (!isProp("reasons")) return false;
  return true;
}

module.exports = function vlidateStatsJson(stats /*: WebpackStats */) {
  if (
    !stats ||
    ((!stats.chunks || !stats.chunks[0].modules) && !stats.modules)
  ) {
    return false;
  }
  const samples = (stats.modules || stats.chunks[0].modules).slice(0, 10);
  return samples.some(isValidModule);
};

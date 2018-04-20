/* @flow */

/*::
import type { WebpackStats } from "./analyze";
*/

const flattenStats = require("./flatten-stats");

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

module.exports = function vlidateStatsJson(rawStats /*: WebpackStats */) {
  if (
    !rawStats ||
    ((!rawStats.chunks || !rawStats.chunks || !rawStats.chunks[0].modules) &&
      !rawStats.modules &&
      (!rawStats.children ||
        ((!rawStats.children[0].chunks ||
          !rawStats.children[0].chunks[0] ||
          !rawStats.children[0].chunks[0].modules) &&
          !rawStats.children[0].modules)))
  ) {
    return false;
  }

  const stats = flattenStats(rawStats);
  let modules = [];

  if (stats.modules && stats.modules.length) {
    modules = stats.modules;
  } else if (stats.chunks) {
    modules = stats.chunks[0].modules;
  } else if (stats.children) {
    if (stats.children[0].modules) {
      modules = stats.children[0].modules;
    } else if (stats.children[0].chunks) {
      modules = stats.children[0].chunks[0].modules;
    }
  }

  const samples = modules.slice(0, 10);
  return samples.some(isValidModule);
};

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
    ((!stats.chunks || !stats.chunks[0].modules) &&
      !stats.modules &&
      (!stats.children ||
        ((!stats.children[0].chunks || !stats.children[0].chunks[0].modules) &&
          !stats.children[0].modules)))
  ) {
    return false;
  }

  let modules = [];

  if (stats.modules) {
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

/* @flow */

/*::
import type { WebpackModule } from "./analyze";
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

module.exports = function vlidateStatsJson(
  modules /*: Array<WebpackModule> */
) {
  const samples = modules.slice(0, 10);
  return samples.some(isValidModule);
};

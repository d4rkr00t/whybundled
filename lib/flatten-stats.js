/* @flow */

/*::

import type { WebpackStats } from "./analyze";
*/

module.exports = function flattenStats(stats /*: WebpackStats */) {
  if (
    !stats.children ||
    !stats.children.length ||
    (stats.chunks && stats.chunks.length)
  ) {
    return stats;
  }

  const flattenChildren = (children, id = "0") =>
    children.reduce((acc, child, index) => {
      child.id = `${id}.${index}`;
      acc = acc.concat(child);
      acc = acc.concat(flattenChildren(child.children || [], child.id));
      return acc;
    }, []);

  const children = flattenChildren(stats.children);

  return children.reduce(
    (acc, child) => {
      acc.chunks = child.chunks ? acc.chunks.concat(child.chunks) : acc.chunks;
      acc.modules = child.modules
        ? acc.modules.concat(child.modules)
        : acc.modules;
      return acc;
    },
    { chunks: [], modules: [] }
  );
};

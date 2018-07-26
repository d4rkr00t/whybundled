// @flow

const print = require("./print");

/* ::
import type { Module, Chunks } from "../analyze";

export type Reporter = {
  print(
    report: Array<Module>,
    chunks: Chunks,
    flags: { [key: string]: any },
    limit: number,
    logger?: (msg?: string) => void
  ): void;
}
*/

const reporter /*: Reporter */ = { print };

module.exports = reporter;

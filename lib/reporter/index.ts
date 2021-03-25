import { print } from "./print";
import type { Module, Chunks } from "../analyze";

export type Reporter = {
  print(
    report: Array<Module>,
    chunks: Chunks,
    flags: { [key: string]: any },
    limit: number,
    logger?: (msg?: string) => void
  ): void;
};

export const reporter: Reporter = { print };

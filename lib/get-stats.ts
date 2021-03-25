import path from "path";
import fs from "fs";
import type { WebpackStats } from "./analyze";

// @ts-expect-error
import { parseChunked } from "@discoveryjs/json-ext";

const getAbsolutePath = (filePath: string) =>
  path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

export async function getStats(statsFilePath: string): Promise<WebpackStats> {
  try {
    const fileStream = fs.createReadStream(getAbsolutePath(statsFilePath), {
      encoding: "utf8",
      autoClose: true,
    });
    try {
      return parseChunked(fileStream);
    } catch (e) {
      throw new Error(`Stats file "${statsFilePath}" is not a valid json...`);
    }
  } catch (e) {
    throw new Error(`No stats file found in: ${statsFilePath}`);
  }
}

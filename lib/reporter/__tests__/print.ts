// @ts-expect-error
import fixtures from "fixturez";
import test from "ava";
import stripAnsi from "strip-ansi";
import { getStats } from "../../get-stats";
import { analyze } from "../../analyze";
import { normalizeStats } from "../../normalize-stats";
import { print } from "../print";

const f = fixtures(__dirname);

const createPrint = () => {
  const messages: Array<string> = [];
  return (msg?: string) => {
    messages.push(stripAnsi(msg || ""));
    return messages;
  };
};

test("should properly print reasons without clearName", async (t) => {
  const stats = analyze(
    normalizeStats(await getStats(f.find("with-external.json")))
  );
  const logger = createPrint();
  print(stats.modules, stats.chunks, {}, 0, logger);
  t.snapshot(logger());
});

test("should properly print simple stats.json", async (t) => {
  const stats = analyze(
    normalizeStats(await getStats(f.find("example-simple-stats.json")))
  );
  const logger = createPrint();
  print(stats.modules, stats.chunks, {}, 0, logger);
  t.snapshot(logger());
});

test("should properly print multi entry stats.json", async (t) => {
  const stats = analyze(
    normalizeStats(await getStats(f.find("multi-entry-stats.json")))
  );
  const logger = createPrint();
  print(stats.modules, stats.chunks, {}, 0, logger);
  t.snapshot(logger());
});

test("should properly print multi entry stats.json with dynamic import", async (t) => {
  const stats = analyze(
    normalizeStats(
      await getStats(f.find("multi-entry-dynamic-import-stats.json"))
    )
  );
  const logger = createPrint();
  print(stats.modules, stats.chunks, {}, 0, logger);
  t.snapshot(logger());
});

test("should properly print multi entry stats.json with no chunks information", async (t) => {
  const stats = analyze(
    normalizeStats(await getStats(f.find("multi-entry-no-chunks-stats.json")))
  );
  const logger = createPrint();
  print(stats.modules, stats.chunks, {}, 0, logger);
  t.snapshot(logger());
});

test("should properly print stats.json with nested children", async (t) => {
  const stats = analyze(
    normalizeStats(await getStats(f.find("nested-children-stats.json")))
  );
  const logger = createPrint();
  print(stats.modules, stats.chunks, {}, 0, logger);
  t.snapshot(logger());
});

test("should properly print stats.json with nested children second example", async (t) => {
  const stats = analyze(
    normalizeStats(await getStats(f.find("nested-children-stats2.json")))
  );
  const logger = createPrint();
  print(stats.modules, stats.chunks, {}, 0, logger);
  t.snapshot(logger());
});

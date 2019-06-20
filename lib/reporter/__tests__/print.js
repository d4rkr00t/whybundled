const stripAnsi = require("strip-ansi");
const test = require("ava");
const fixtures = require("fixturez");
const f = fixtures(__dirname);
const getStats = require("../../get-stats");
const analyze = require("../../analyze");
const print = require("../print");
const normalizeStats = require("../../normalize-stats");

const createPrint = () => {
  const messages = [];
  return msg => {
    messages.push(stripAnsi(msg) || "");
    return messages;
  };
};

test("should properly print reasons without clearName", t => {
  const stats = analyze(normalizeStats(getStats(f.find("with-external.json"))));
  const logger = createPrint();
  print(stats.modules, stats.chunks, {}, 0, logger);
  t.snapshot(logger());
});

test("should properly print simple stats.json", t => {
  const stats = analyze(
    normalizeStats(getStats(f.find("example-simple-stats.json")))
  );
  const logger = createPrint();
  print(stats.modules, stats.chunks, {}, 0, logger);
  t.snapshot(logger());
});

test("should properly print multi entry stats.json", t => {
  const stats = analyze(
    normalizeStats(getStats(f.find("multi-entry-stats.json")))
  );
  const logger = createPrint();
  print(stats.modules, stats.chunks, {}, 0, logger);
  t.snapshot(logger());
});

test("should properly print multi entry stats.json with dynamic import", t => {
  const stats = analyze(
    normalizeStats(getStats(f.find("multi-entry-dynamic-import-stats.json")))
  );
  const logger = createPrint();
  print(stats.modules, stats.chunks, {}, 0, logger);
  t.snapshot(logger());
});

test("should properly print multi entry stats.json with no chunks information", t => {
  const stats = analyze(
    normalizeStats(getStats(f.find("multi-entry-no-chunks-stats.json")))
  );
  const logger = createPrint();
  print(stats.modules, stats.chunks, {}, 0, logger);
  t.snapshot(logger());
});

test("should properly print stats.json with nested children", t => {
  const stats = analyze(
    normalizeStats(getStats(f.find("nested-children-stats.json")))
  );
  const logger = createPrint();
  print(stats.modules, stats.chunks, {}, 0, logger);
  t.snapshot(logger());
});

test("should properly print stats.json with nested children second example", t => {
  const stats = analyze(
    normalizeStats(getStats(f.find("nested-children-stats2.json")))
  );
  const logger = createPrint();
  print(stats.modules, stats.chunks, {}, 0, logger);
  t.snapshot(logger());
});

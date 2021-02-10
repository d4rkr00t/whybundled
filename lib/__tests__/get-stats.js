const test = require("ava");
const fixtures = require("fixturez");
const f = fixtures(__dirname);
const getStats = require("../get-stats");

test("should load stats file", async t => {
  const stats = await getStats(f.find("empty-stats.json"));
  t.truthy(stats);
});

test("should load stats file with an extra output before the json", async t => {
  const stats = await getStats(f.find("with-output-before-stats-json.json"));
  t.truthy(stats);
});

test("should throw an error if stats file doesn't exist", async t => {
  t.throws(async () => await getStats("not_existing_file.json"));
});

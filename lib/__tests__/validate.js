const test = require("ava");
const fixtures = require("fixturez");
const f = fixtures(__dirname);
const validate = require("../validate");
const getStats = require("../get-stats");
const normalizeStats = require("../normalize-stats");

test(`should return false for an invalid stats file that doesn't have "reasons" for modules`, async t => {
  const stats = normalizeStats(
    await getStats(f.find("invalid-no-reasons.json"))
  );
  t.falsy(validate(stats.modules));
});

test(`should return false for an invalid stats file that doesn't have niether chunks nor modules`, async t => {
  const stats = normalizeStats(await getStats(f.find("empty-stats.json")));
  t.falsy(validate(stats.modules));
});

test("should return true for a valid stats file", async t => {
  const stats = normalizeStats(await getStats(f.find("valid.json")));
  t.truthy(validate(stats.modules));
});

test("should return true for a valid stats file with children", async t => {
  const stats = normalizeStats(
    await getStats(f.find("valid-with-children.json"))
  );
  t.truthy(validate(stats.modules));
});

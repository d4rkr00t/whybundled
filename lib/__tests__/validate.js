const test = require("ava");
const fixtures = require("fixturez");
const f = fixtures(__dirname);
const validate = require("../validate");
const getStats = require("../get-stats");

test(`should return false for an invalid stats file that doesn't have "reasons" for modules`, t => {
  const stats = getStats(f.find("invalid-no-reasons.json"));
  t.falsy(validate(stats));
});

test(`should return false for an invalid stats file that doesn't have niether chunks nor modules`, t => {
  const stats = getStats(f.find("empty-stats.json"));
  t.falsy(validate(stats));
});

test("should return true for a valid stats file", t => {
  const stats = getStats(f.find("valid.json"));
  t.truthy(validate(stats));
});

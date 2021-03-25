// @ts-expect-error
import fixtures from "fixturez";
import test from "ava";
import { getStats } from "../get-stats";
import { normalizeStats } from "../normalize-stats";
import { vlidateStatsJson } from "../validate";

const f = fixtures(__dirname);

test(`should return false for an invalid stats file that doesn't have "reasons" for modules`, async (t) => {
  const stats = normalizeStats(
    await getStats(f.find("invalid-no-reasons.json"))
  );
  t.falsy(vlidateStatsJson(stats.modules));
});

test(`should return false for an invalid stats file that doesn't have niether chunks nor modules`, async (t) => {
  const stats = normalizeStats(await getStats(f.find("empty-stats.json")));
  t.falsy(vlidateStatsJson(stats.modules));
});

test("should return true for a valid stats file", async (t) => {
  const stats = normalizeStats(await getStats(f.find("valid.json")));
  t.truthy(vlidateStatsJson(stats.modules));
});

test("should return true for a valid stats file with children", async (t) => {
  const stats = normalizeStats(
    await getStats(f.find("valid-with-children.json"))
  );
  t.truthy(vlidateStatsJson(stats.modules));
});

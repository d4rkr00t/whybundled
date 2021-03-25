// @ts-expect-error
import fixtures from "fixturez";
import test from "ava";
import { getStats } from "../get-stats";

const f = fixtures(__dirname);

test("should load stats file", async (t) => {
  const stats = await getStats(f.find("empty-stats.json"));
  t.truthy(stats);
});

test("should throw an error if stats file doesn't exist", async (t) => {
  await t.throwsAsync(async () => await getStats("not_existing_file.json"));
});

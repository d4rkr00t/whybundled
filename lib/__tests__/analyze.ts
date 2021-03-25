// @ts-expect-error
import fixtures from "fixturez";
import test from "ava";
import { getStats } from "../get-stats";
import { analyze } from "../analyze";
import { normalizeStats } from "../normalize-stats";

const f = fixtures(__dirname);

test("should call updateProgressBar correct number of times", async (t) => {
  let calls = 0;
  const updateProgressBar = () => {
    calls++;
  };
  const stats = analyze(
    normalizeStats(await getStats(f.find("valid-with-multiple-modules.json"))),
    [],
    updateProgressBar
  );
  t.is(calls, 2);
});

test("should handle stats file with a chunk which has empty modules", async (t) => {
  t.snapshot(
    analyze(
      normalizeStats(
        await getStats(f.find("valid-with-empty-modules-in-chunks.json"))
      ),
      [],
      () => {}
    )
  );
});

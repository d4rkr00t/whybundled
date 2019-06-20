const test = require("ava");
const fixtures = require("fixturez");
const f = fixtures(__dirname);
const getStats = require("../get-stats");
const analyze = require("../analyze");
const normalizeStats = require("../normalize-stats");

test("should call updateProgressBar correct number of times", t => {
  let calls = 0;
  const updateProgressBar = ({ progress }) => {
    calls++;
  };
  const stats = analyze(
    normalizeStats(getStats(f.find("valid-with-multiple-modules.json"))),
    [],
    updateProgressBar
  );
  t.is(calls, 2);
});

test("should handle stats file with a chunk which has empty modules", t => {
  t.snapshot(
    analyze(
      normalizeStats(
        getStats(f.find("valid-with-empty-modules-in-chunks.json"))
      ),
      [],
      () => {}
    )
  );
});

const test = require("ava");
const fixtures = require("fixturez");
const f = fixtures(__dirname);
const getStats = require("../get-stats");
const analyze = require("../analyze");

test("should call updateProgressBar correct number of times", t => {
  let calls = 0;
  const updateProgressBar = ({ progress }) => {
    calls++;
  };
  const stats = analyze(
    getStats(f.find("valid-with-multiple-modules.json")),
    [],
    updateProgressBar
  );
  t.is(calls, 2);
});

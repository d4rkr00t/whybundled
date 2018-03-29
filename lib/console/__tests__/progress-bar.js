const stripAnsi = require("strip-ansi");
const test = require("ava");
const fixtures = require("fixturez");
const f = fixtures(__dirname);
const createProgressBar = require("../progress-bar");

[
  { progress: 0 },
  { progress: 30, title: "title", text: "text" },
  { progress: 50, text: "text" },
  { progress: 75, title: "title" },
  { progress: 100 }
].forEach(testCase => {
  test(`should output correct progress for ${JSON.stringify(testCase)}`, t => {
    const writes = [];
    const stdout = {
      columns: 100,
      write(str) {
        writes.push(stripAnsi(str || ""));
      }
    };
    const updateProgressBar = createProgressBar(stdout);
    updateProgressBar(testCase);
    t.snapshot(writes);
  });
});

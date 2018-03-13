const stripAnsi = require("strip-ansi");
const test = require("ava");
const fixtures = require("fixturez");
const f = fixtures(__dirname);
const getStats = require("../get-stats");
const analyze = require("../analyze");
const print = require("../print");

const createPrint = () => {
  const messages = [];
  return msg => {
    messages.push(stripAnsi(msg) || "");
    return messages;
  };
};

test("should properly print reasons without clearName", t => {
  const stats = analyze(getStats(f.find("with-external.json")));
  const logger = createPrint();
  print(stats, {}, 0, logger);
  t.snapshot(logger());
});

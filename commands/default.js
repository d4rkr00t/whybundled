const path = require("path");
const { analyze, print } = require("../lib");

const getAbsoultePath = statsPath =>
  path.isAbsolute(statsPath) ? statsPath : path.join(process.cwd(), statsPath);

module.exports = function defaultCommand(statsFilePath, flags) {
  const stats = require(getAbsoultePath(statsFilePath));
  print(analyze(stats, flags), flags);
};

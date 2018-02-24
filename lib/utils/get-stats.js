const path = require("path");

const getAbsoultePath = filePath =>
  path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

module.exports = function getStats(statsFilePath) {
  try {
    return require(getAbsoultePath(statsFilePath));
  } catch (e) {
    throw new Error(`No stats file found in: ${statsFilePath}`);
  }
};

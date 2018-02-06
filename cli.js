#!/usr/bin/env node

const { analyze, print } = require("./lib");

const statsPath = process.argv[process.argv.length - 1];
const report = analyze(statsPath);

print(report);

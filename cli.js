#!/usr/bin/env node

const meow = require("meow");
const defaultCommand = require("./commands/default");
const byCommand = require("./commands/by");

const { pkg, input, flags } = meow({
  argv: process.argv.slice(2)
});

const start = Date.now();

if (!input[0].match(".json")) {
  console.error("First argument must be a path to stats.json file...");
  process.exit(1);
}

if (flags.by) {
  byCommand(input[0], flags, input[1]);
} else {
  defaultCommand(input[0], flags, input[1]);
}

const timing = (Date.now() - start) / 1000;
const rounded = Math.round(timing * 100) / 100;
console.log(`🏁  Done in ${rounded}s.`);

/**
 * default:
 * – input: stats.json pattern?
 * – flags:
 *   --modulesOnly [x]
 *   --directOnly [x]
 *   --transitiveOnly [x]
 *   --duplicatesOnly [x]
 *   --filesOnly [x]
 */

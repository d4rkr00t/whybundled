#!/usr/bin/env node

const meow = require("meow");
const defaultCommand = require("./commands/default");

const { pkg, input, flags } = meow({
  argv: process.argv.slice(2)
});

const start = Date.now();

if (input[0].match(".json")) {
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

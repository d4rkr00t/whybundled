#!/usr/bin/env node
/* @flow */

const meow = require("meow");
const defaultCommand = require("./commands/default");
const byCommand = require("./commands/by");
const helpCommand = require("./commands/help");

const { pkg, input, flags, showHelp } = meow(helpCommand(), {
  argv: process.argv.slice(2),
  autoHelp: false
});

const start = Date.now();

if (!input || !input.length || !input[0].match(".json") || flags.help) {
  showHelp(0);
}

if (flags.by) {
  byCommand(input[0], flags, input[1]);
} else {
  defaultCommand(input[0], flags, input[1]);
}

const timing = (Date.now() - start) / 1000;
const rounded = Math.round(timing * 100) / 100;

console.log(`🏁  Done in ${rounded}s.`);

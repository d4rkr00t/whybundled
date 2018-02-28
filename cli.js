#!/usr/bin/env node
/* @flow */

const meow = require("meow");
const chalk = require("chalk");
const defaultCommand = require("./commands/default");
const byCommand = require("./commands/by");
const helpCommand = require("./commands/help");
const knownFlags = [
  "by",
  "modulesOnly",
  "filesOnly",
  "directOnly",
  "transitiveOnly",
  "duplicatesOnly",
  "limit",
  "version",
  "help"
];

const validateFlags = flags => {
  const invalidFlags = Object.keys(flags).reduce((acc, flag) => {
    if (!knownFlags.includes(flag)) {
      acc.push(flag);
    }
    return acc;
  }, []);

  return invalidFlags;
};

const { pkg, input, flags, showHelp } = meow(helpCommand(), {
  argv: process.argv.slice(2),
  autoHelp: false
});

const start = Date.now();
const invalidFlags = validateFlags(flags);

if (invalidFlags.length) {
  console.log();
  console.log(chalk.red(`  Unsupported option: ${invalidFlags.join(", ")}`));
  console.log();
  console.log(
    `  Use ${chalk.yellow("--help")} to see a list of available options...`
  );
  process.exit(1);
}

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

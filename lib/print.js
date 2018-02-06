const chalk = require("chalk");
const { table, getBorderCharacters } = require("table");

const greenBadge = label => chalk.bgGreen.black(` ${label} `);
const yellowBadge = label => chalk.bgYellow.black(` ${label} `);
const blueBadge = label => chalk.bgBlue.black(` ${label} `);
const redBadge = label => chalk.bgRed.black(` ${label} `);
const magentaBadge = label => chalk.bgMagenta.black(` ${label} `);
const moduleBadge = () => yellowBadge("MODULE");
const fileBadge = () => greenBadge("FILE");
const entryPointBadge = () => magentaBadge("ENTRY");
const directBadge = () => greenBadge("DIRECT");
const transitiveBadge = () => redBadge("TRANSITIVE");

const toArray = report =>
  Object.keys(report).map(name => ({ ...report[name], name: name }));

const printFile = module => {
  const limit = 10;
  const [file] = module.modules;

  console.log(
    `${module.freq === 0 ? entryPointBadge() : fileBadge()} ${
      module.name
    } ${chalk.dim("[" + module.freq + "]")}`
  );

  // If freq === 0 it's an entry point.
  if (module.freq === 0) return;

  console.log("");
  console.log(chalk.magenta("Reasons: "));
  const reasonsTableData = file.reasons
    .slice(0, limit)
    .map(reason => [reason.moduleName, reason.type]);

  reasonsTableData.unshift([chalk.bold("Issuer"), chalk.bold("Type")]);

  if (file.reasons.length > limit) {
    reasonsTableData.push([
      chalk.dim(`... ${file.reasons.length - limit} reasons`),
      " "
    ]);
  }

  console.log(
    table(reasonsTableData, {
      border: getBorderCharacters("norc")
    })
  );
};

const printModule = module => {
  const limit = 20;
  console.log(
    `${moduleBadge()} ${module.isDirect ? directBadge() : transitiveBadge()} ${
      module.name
    } ${chalk.dim("[" + module.freq + "]")}`
  );
  console.log("");
  console.log(chalk.magenta("Reasons: "));

  const reasonsTableData = module.modules.reduce(
    (acc, module) =>
      acc
        .concat(
          module.reasons
            .sort(
              (r1, r2) =>
                r1.internal && !r2.internal
                  ? 1
                  : !r1.internal && r2.internal ? -1 : 0
            )
            .map(reason => [
              module.name,
              reason.clearName,
              reason.moduleName,
              reason.internal ? chalk.yellow("yes") : chalk.red("no"),
              reason.typem
            ])
        )
        .slice(0, limit),
    []
  );

  reasonsTableData.unshift([
    chalk.bold("Imported"),
    chalk.bold("By"),
    chalk.bold("Issuer"),
    chalk.bold("Internal"),
    chalk.bold("Type")
  ]);

  console.log(
    table(reasonsTableData, {
      border: getBorderCharacters("norc"),
      columns: {
        0: {
          width: 40
        },
        2: {
          width: 40
        }
      }
    })
  );
};

module.exports = function print(report) {
  toArray(report)
    .sort((a, b) => b.freq - a.freq)
    .forEach(module => {
      if (module.external) {
        printModule(module);
      } else {
        printFile(module);
      }
      console.log(chalk.dim("-----"));
      console.log();
    });
};

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

const printFile = (module, noReasons) => {
  const limit = 10;
  const [file] = module.modules;

  console.log(
    `${module.freq === 0 ? entryPointBadge() : fileBadge()} ${
      module.name
    } ${chalk.dim("[" + module.freq + "]")}`
  );

  // If freq === 0 it's an entry point.
  if (module.freq === 0) return;
  if (noReasons) return;

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

const printModule = (module, noReasons) => {
  const limit = 20;
  console.log(
    `${moduleBadge()} ${module.isDirect ? directBadge() : transitiveBadge()} ${
      module.name
    } ${chalk.dim("[" + module.freq + "]")}`
  );

  if (noReasons) return;

  console.log("");
  console.log(chalk.magenta("Reasons: "));

  const reasonsTableData = module.modules
    .reduce((acc, module) => {
      return acc.concat(
        module.reasons.map(reason => ({
          name: module.name,
          reasonClearName: reason.clearName,
          reasonModuleName: reason.moduleName,
          internal: reason.internal,
          external: reason.external,
          type: reason.type
        }))
      );
    }, [])
    .sort(
      (a, b) =>
        !a.internal && !a.external && (b.internal || b.external) ? -1 : 0
    )
    .filter(reason => !reason.internal)
    .slice(0, limit)
    .map(reason => [
      reason.name,
      reason.reasonClearName,
      reason.reasonModuleName,
      reason.internal ? chalk.yellow("yes") : chalk.red("no"),
      reason.type
    ]);

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

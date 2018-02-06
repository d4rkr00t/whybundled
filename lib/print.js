const chalk = require("chalk");
const treeify = require("treeify");

const greenBadge = label => chalk.bgGreen.black(` ${label} `);
const yellowBadge = label => chalk.bgYellow.black(` ${label} `);
const blueBadge = label => chalk.bgBlue.black(` ${label} `);
const redBadge = label => chalk.bgRed.black(` ${label} `);
const magentaBadge = label => chalk.bgMagenta.black(` ${label} `);
const moduleBadge = () => yellowBadge("MODULE");
const fileBadge = () => greenBadge("FILE");
const entryPointBadge = () => chalk.magenta("[entry]");
const directBadge = () => chalk.green("[direct]");
const transitiveBadge = () => chalk.red("[transitive]");

const printTree = tree => treeify.asTree(tree).split("\n");

const toArray = report =>
  Object.keys(report).map(name => ({ ...report[name], name: name }));

const indent = (list, char = "│") => list.map(item => `${char}  ${item}`);
const printImportedCount = count =>
  `${count} ${count === 1 ? "time" : "times"}`;
const printReasons = reasons => {
  const tree = reasons.slice(0, 20).reduce((acc, reason) => {
    if (reason.type === "file") {
      acc[
        `${reason.moduleName}  ${chalk.dim(reason.loc)}  ${chalk.dim(
          "[" + reason.importType + "]"
        )}`
      ] = null;
    } else if (reason.type === "module") {
      const subReasons = (reason.reasons || [])
        .slice(0, 10)
        .reduce((acc, r) => {
          acc[
            `${r.moduleName}  ${chalk.dim(r.loc)}  ${chalk.dim(
              "[" + r.importType + "]"
            )}`
          ] = null;
          return acc;
        }, {});
      if ((reason.reasons || []).length > 10) {
        subReasons[chalk.dim(`... ${reason.reasons.length - 10} more`)] = null;
      }
      acc[`${chalk.yellow(reason.clearName)}`] = subReasons;
    }

    return acc;
  }, {});

  if (reasons.length > 20) {
    tree[chalk.dim(`... ${reasons.length - 20} more`)] = null;
  }

  return printTree(tree);
};

const printLocations = locations =>
  printTree(
    locations.reduce((acc, loc) => {
      acc[loc] = null;
      return acc;
    }, {})
  );

const printIncludedFiles = files => {
  const tree = files.slice(0, 10).reduce((acc, file) => {
    acc[file] = null;
    return acc;
  }, {});

  if (files.length > 10) {
    tree[chalk.dim(`... ${files.length - 10} more`)] = null;
  }

  return printTree(tree);
};

const printType = module => {
  const type = [
    `├─ ${chalk.magenta("type")}: ${
      module.depsType === "direct" ? directBadge() : transitiveBadge()
    }`
  ];

  if (module.depsType === "transitive") {
    type.push(
      indent(
        printTree(
          module.depsChains.reduce((acc, chain) => {
            acc[
              `${module.name} ${chalk.dim("->")} ${chain.join(
                chalk.dim(" -> ")
              )}`
            ] = null;
            return acc;
          }, {})
        )
      ).join("\n")
    );
  }

  return type;
};

const printFile = module => {
  return [
    `${fileBadge()} ${chalk.green(module.name)}`,
    `├─ ${chalk.magenta("imported")}: ${printImportedCount(module.imported)}`,
    `└─ ${chalk.magenta("reasons")}:`,
    indent(printReasons(module.reasons), " ").join("\n")
  ];
};

const printModule = module => {
  return [
    `${moduleBadge()} ${chalk.yellow(module.name)}`,
    `├─ ${chalk.magenta("imported")}: ${printImportedCount(module.imported)}`,
    printType(module).join("\n"),
    `├─ ${chalk.magenta("locations")}: ${
      module.locations.length > 1 ? chalk.red("[multiple]") : ""
    }`,
    indent(printLocations(module.locations)).join("\n"),
    `├─ ${chalk.magenta("files")}: `,
    indent(printIncludedFiles(module.filesIncluded)).join("\n"),
    `└─ ${chalk.magenta("reasons")}:`,
    indent(printReasons(module.reasons), " ").join("\n")
  ];
};

module.exports = function print(report) {
  toArray(report)
    .sort((a, b) => b.imported - a.imported)
    .filter(module => module.imported > 0)
    .forEach(module => {
      if (module.type === "file" && module.imported > 0) {
        console.log(printFile(module).join("\n"));
      } else if (module.type === "module") {
        console.log(printModule(module).join("\n"));
      }

      console.log(chalk.dim("--------------------"));
      console.log();
    });
};

const chalk = require("chalk");
const treeify = require("treeify");

const greenBadge = label => chalk.bgGreen.black(` ${label} `);
const yellowBadge = label => chalk.bgYellow.black(` ${label} `);
const blueBadge = label => chalk.bgBlue.black(` ${label} `);
const redBadge = label => chalk.bgRed.black(` ${label} `);
const magentaBadge = label => chalk.bgMagenta.black(` ${label} `);
const cyanBadge = label => chalk.bgCyan.black(` ${label} `);
const moduleBadge = () => yellowBadge("MODULE");
const fileBadge = () => greenBadge("FILE");
const entryPointBadge = () => chalk.magenta("[entry]");
const directBadge = () => chalk.green("[direct]");
const transitiveBadge = () => chalk.red("[transitive]");

const takeSubset = (array, limit) =>
  limit === 0 ? array : array.slice(0, limit);

const printTree = tree => treeify.asTree(tree).split("\n");

const indent = (list, char = "│") => list.map(item => `${char}  ${item}`);

const printImportedCount = count =>
  `${count} ${count === 1 ? "time" : "times"}`;

const sortReasons = (reasons, by) => {
  return by
    ? []
        .concat(reasons)
        .sort(
          (a, b) =>
            (a.moduleName === by || a.clearName === by) &&
            (b.moduleName !== by && b.clearName !== by)
              ? -1
              : a.moduleName !== by &&
                a.clearName !== by &&
                (b.moduleName !== by && b.clearName !== by)
                ? 0
                : 1
        )
    : reasons;
};

const printReasons = (rawReasons, limit, by) => {
  const reasons = sortReasons(rawReasons, by);
  const reasonsSubSet = takeSubset(reasons, limit);

  const printReasonName = (name, by) =>
    by === name ? cyanBadge(` ${name} `) : name;
  const printReasonNameModule = (name, by) =>
    by === name ? cyanBadge(` ${name} `) : chalk.yellow(name);

  const tree = reasonsSubSet.reduce((acc, reason) => {
    if (reason.type === "file") {
      acc[
        `${printReasonName(reason.moduleName, by)}  ${chalk.dim(
          reason.loc
        )}  ${chalk.dim("[" + reason.importType + "]")}`
      ] = null;
    } else if (reason.type === "module") {
      const subReasonsSubset = takeSubset(
        sortReasons(reason.reasons, by) || [],
        limit
      );
      const subReasons = subReasonsSubset.reduce((acc, r) => {
        acc[
          `${printReasonName(r.moduleName, by)}  ${chalk.dim(
            r.loc
          )}  ${chalk.dim("[" + r.importType + "]")}`
        ] = null;
        return acc;
      }, {});

      if (subReasonsSubset.length < (reason.reasons || []).length) {
        subReasons[
          chalk.dim(`... ${reason.reasons.length - limit} more`)
        ] = null;
      }

      acc[`${printReasonNameModule(reason.clearName, by)}`] = subReasons;
    }

    return acc;
  }, {});

  if (reasonsSubSet.length < reasons.length) {
    tree[chalk.dim(`... ${reasons.length - limit} more`)] = null;
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

const printIncludedFiles = (files, limit) => {
  const filesSubset = takeSubset(files, limit);
  const tree = filesSubset.reduce((acc, file) => {
    acc[file] = null;
    return acc;
  }, {});

  if (filesSubset.length < files.length) {
    tree[chalk.dim(`... ${files.length - limit} more`)] = null;
  }

  return printTree(tree);
};

const printType = (module, by) => {
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
              `${module.name} ${chalk.dim("->")} ${chain
                .map(dep => (dep === by ? cyanBadge(` ${dep} `) : dep))
                .join(chalk.dim(" -> "))}`
            ] = null;
            return acc;
          }, {})
        )
      ).join("\n")
    );
  }

  return type;
};

const printFile = (module, limit, by) => {
  return [
    `${fileBadge()} ${chalk.green(module.name)}`,
    `├─ ${chalk.magenta("imported")}: ${printImportedCount(module.imported)}`,
    `└─ ${chalk.magenta("reasons")}:`,
    indent(printReasons(module.reasons, limit, by), " ").join("\n")
  ];
};

const printModule = (module, limit, by) => {
  return [
    `${moduleBadge()} ${chalk.yellow(module.name)}`,
    `├─ ${chalk.magenta("imported")}: ${printImportedCount(module.imported)}`,
    printType(module, by).join("\n"),
    `├─ ${chalk.magenta("locations")}: ${
      module.locations.length > 1 ? redBadge("multiple") : ""
    }`,
    indent(printLocations(module.locations)).join("\n"),
    `├─ ${chalk.magenta("files")}: `,
    indent(printIncludedFiles(module.filesIncluded, limit)).join("\n"),
    `└─ ${chalk.magenta("reasons")}:`,
    indent(printReasons(module.reasons, limit, by), " ").join("\n")
  ];
};

module.exports = function print(report, flags, limit) {
  report
    .sort((a, b) => b.imported - a.imported)
    .filter(module => module.imported > 0)
    .forEach(module => {
      if (module.type === "file") {
        console.log();
        console.log(printFile(module, limit, flags.by).join("\n"));
        console.log(chalk.dim("--------------------"));
        console.log();
      } else if (module.type === "module") {
        console.log();
        console.log(printModule(module, limit, flags.by).join("\n"));
        console.log(chalk.dim("--------------------"));
        console.log();
      }
    });
};

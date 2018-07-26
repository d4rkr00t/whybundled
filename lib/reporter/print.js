/* @flow */

const chalk = require("chalk");
const treeify = require("treeify");

/*::
import type { Module, Reason, SubReason, Chunks } from '../analyze';
*/

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

const sep = () => chalk.dim("––––––––––––––––––––");

const isEntry = (reasons /*: Array<Reason>*/) =>
  reasons.length === 1 && reasons[0].type === "entry";

const takeSubset = (array /*: Array<any> */, limit) =>
  limit === 0 ? array : array.slice(0, limit);

const printTree = tree => treeify.asTree(tree).split("\n");

const indent = (list, char = "│") => list.map(item => `${char}  ${item}`);

const printImportedCount = count =>
  `${count} ${count === 1 ? "time" : "times"}`;

const sortReasons = (reasons /*: Array<Reason> | Array<SubReason> */, by) => {
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

const printReasons = (
  rawReasons /*: Array<Reason> */,
  limit /*: number */,
  by /*?: string */
) => {
  const reasons = sortReasons(rawReasons, by);
  const reasonsSubSet = takeSubset(reasons, limit);

  const printReasonName = (name, by) =>
    by === name ? cyanBadge(` ${name} `) : name;
  const printReasonNameModule = (name, by) =>
    by === name ? cyanBadge(` ${name} `) : chalk.yellow(name);

  const tree = reasonsSubSet.reduce((acc, reason /*: Reason */) => {
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
      const subReasons = subReasonsSubset.reduce((acc, r /*: SubReason*/) => {
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

      acc[
        `${printReasonNameModule(reason.clearName || reason.moduleName, by)}`
      ] = subReasons;
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
    locations.reduce((acc, loc /*: string */) => {
      acc[loc] = null;
      return acc;
    }, {})
  );

const printIncludedFiles = (files, limit) => {
  const filesSubset = takeSubset(files, limit);
  const tree = filesSubset.reduce((acc, file /*: string */) => {
    acc[file] = null;
    return acc;
  }, {});

  if (filesSubset.length < files.length) {
    tree[chalk.dim(`... ${files.length - limit} more`)] = null;
  }

  return printTree(tree);
};

const printType = (module, by, limit) => {
  const type = [
    `├─ ${chalk.magenta("type")}: ${
      module.depsType === "direct" ? directBadge() : transitiveBadge()
    }`
  ];

  if (module.depsType === "transitive") {
    const depsChainsSubset = takeSubset(module.depsChains, limit);
    const depsChains = depsChainsSubset.reduce((acc, chain) => {
      acc[
        `${module.name} ${chalk.dim("->")} ${chain
          .map(dep => (dep === by ? cyanBadge(` ${dep} `) : dep))
          .join(chalk.dim(" -> "))}`
      ] = null;
      return acc;
    }, {});

    if (depsChainsSubset.length < module.depsChains.length) {
      depsChains[
        chalk.dim(`... ${module.depsChains.length - limit} more`)
      ] = null;
    }

    type.push(indent(printTree(depsChains)).join("\n"));
  }

  return type;
};

const printSize = (size /*: number */, mod = false) => {
  const sizeInKiB = Math.ceil(size / 1024);
  const level =
    sizeInKiB === 0
      ? "unknown"
      : sizeInKiB > 20
        ? "red"
        : sizeInKiB < 20 && sizeInKiB > 10 ? "yellow" : "default";
  const sizeFormatted =
    level === "unknown"
      ? chalk.dim("unknown")
      : level === "default"
        ? sizeInKiB + " KiB"
        : chalk[level](sizeInKiB + " KiB");
  return `${chalk.magenta("size")}: ${sizeFormatted}${
    mod ? chalk.dim(" [for all included files]") : ""
  }`;
};

const printChunkInfo = (module /*: Module */, chunks /*: Chunks */) => {
  return module.chunks.reduce((acc, chunkId) => {
    const chunk = chunks[chunkId];
    if (!chunk) return acc;
    acc =
      chunk.names && chunk.names.length
        ? acc.concat(chunk.names)
        : acc.concat(chunk.id);
    return acc;
  }, []);
};

const printFile = (module /*: Module */, chunks, limit, by) => {
  const chunksInfo = printChunkInfo(module, chunks);
  const entry = isEntry(module.reasons);
  return [
    `${fileBadge()} ${chalk.green(module.name)}${
      entry ? " " + entryPointBadge() : ""
    }`,
    `├─ ${chalk.magenta("imported")}: ${printImportedCount(module.imported)}`,
    `├─ ${printSize(module.size)}`,
    chunksInfo &&
      chunksInfo.length &&
      `${entry ? "└─" : "├─"} ${chalk.magenta("chunks")}: ${chunksInfo.join(
        ", "
      )}`,
    !entry && `└─ ${chalk.magenta("reasons")}:`,
    !entry && indent(printReasons(module.reasons, limit, by), " ").join("\n")
  ].filter(msg => !!msg);
};

const printModule = (module /*: Module */, chunks, limit, by) => {
  const chunksInfo = printChunkInfo(module, chunks);
  const entry = isEntry(module.reasons);
  return [
    `${moduleBadge()} ${chalk.yellow(module.name)}${
      entry ? " " + entryPointBadge() : ""
    }`,
    `├─ ${chalk.magenta("imported")}: ${printImportedCount(module.imported)}`,
    `├─ ${chalk.magenta("deps count")}: ${module.deps}`,
    `├─ ${printSize(module.size, true)}`,
    printType(module, by, limit).join("\n"),
    chunksInfo &&
      chunksInfo.length &&
      `├─ ${chalk.magenta("chunks")}: ${chunksInfo.join(", ")}`,
    `├─ ${chalk.magenta("locations")}: ${
      module.locations.length > 1 ? redBadge("multiple") : ""
    }`,
    indent(printLocations(module.locations)).join("\n"),
    `${entry ? "└─" : "├─"} ${chalk.magenta("files")}: `,
    indent(printIncludedFiles(module.filesIncluded, limit)).join("\n"),
    !entry && `└─ ${chalk.magenta("reasons")}:`,
    !entry && indent(printReasons(module.reasons, limit, by), " ").join("\n")
  ].filter(msg => !!msg);
};

module.exports = function print(
  report /*: Array<Module> */,
  chunks /*: Chunks */,
  flags /*: { by?: string } */,
  limit /*: number */,
  logger /*: (msg?: string) => void*/ = console.log
) {
  report
    .sort((a, b) => b.imported - a.imported)
    .filter(module => module.imported > 0)
    .forEach(module => {
      if (module.type === "file") {
        logger();
        logger(printFile(module, chunks, limit, flags.by).join("\n"));
        logger(sep());
        logger();
      } else if (module.type === "module") {
        logger();
        logger(printModule(module, chunks, limit, flags.by).join("\n"));
        logger(sep());
        logger();
      }
    });
};

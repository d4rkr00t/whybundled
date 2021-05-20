import {
  bgGreen,
  bgYellow,
  bgRed,
  bgCyan,
  magenta,
  green,
  red,
  dim,
  black,
  yellow,
} from "colorette";
import treeify from "treeify";

import type { Module, Reason, SubReason, Chunks } from "../analyze";

const greenBadge = (label: string) => bgGreen(black(` ${label} `));
const yellowBadge = (label: string) => bgYellow(black(` ${label} `));
const redBadge = (label: string) => bgRed(black(` ${label} `));
const cyanBadge = (label: string) => bgCyan(black(` ${label} `));
const moduleBadge = () => yellowBadge("MODULE");
const fileBadge = () => greenBadge("FILE");
const entryPointBadge = () => magenta("[entry]");
const directBadge = () => green("[direct]");
const transitiveBadge = () => red("[transitive]");

const sep = () => dim("––––––––––––––––––––");

const isEntry = (reasons: Array<Reason>) =>
  reasons.length === 1 && reasons[0].type === "entry";

const takeSubset = <T>(array: Array<T>, limit: number): Array<T> =>
  limit === 0 ? array : array.slice(0, limit);

const printTree = (tree: treeify.TreeObject) =>
  treeify.asTree(tree, false, false).split("\n");

const indent = (list: Array<string>, char = "│") =>
  list.map((item) => `${char}  ${item}`);

const printImportedCount = (count: number) =>
  `${count} ${count === 1 ? "time" : "times"}`;

const sortReasons = (
  reasons: Array<Reason> | Array<SubReason>,
  by?: string
): Array<Reason> | Array<SubReason> => {
  return by
    ? ([] as Array<Reason | SubReason>)
        .concat(reasons)
        .sort((a, b) =>
          (a.moduleName === by || (a as Reason).clearName === by) &&
          b.moduleName !== by &&
          (b as Reason).clearName !== by
            ? -1
            : a.moduleName !== by &&
              (a as Reason).clearName !== by &&
              b.moduleName !== by &&
              (b as Reason).clearName !== by
            ? 0
            : 1
        )
    : reasons;
};

const printReasons = (
  rawReasons: Array<Reason>,
  limit: number,
  by?: string
) => {
  const reasons = sortReasons(rawReasons, by);
  const reasonsSubSet = takeSubset(reasons, limit) as Array<Reason>;

  const printReasonName = (name: string, by?: string) =>
    by === name ? cyanBadge(` ${name} `) : name;
  const printReasonNameModule = (name: string, by?: string) =>
    by === name ? cyanBadge(` ${name} `) : yellow(name);

  const tree = reasonsSubSet.reduce<treeify.TreeObject>(
    (acc, reason: Reason) => {
      if (reason.type === "file") {
        acc[
          `${printReasonName(reason.moduleName, by)}  ${dim(reason.loc)}  ${dim(
            "[" + reason.importType + "]"
          )}`
        ] = "null";
      } else if (reason.type === "module") {
        const subReasonsSubset = takeSubset(
          sortReasons(reason.reasons, by) || [],
          limit
        );
        const subReasons = subReasonsSubset.reduce<treeify.TreeObject>(
          (acc, r: SubReason) => {
            acc[
              `${printReasonName(r.moduleName, by)}  ${dim(r.loc)}  ${dim(
                "[" + r.importType + "]"
              )}`
            ] = "null";
            return acc;
          },
          {}
        );

        if (subReasonsSubset.length < (reason.reasons || []).length) {
          subReasons[dim(`... ${reason.reasons.length - limit} more`)] = "null";
        }

        acc[
          `${printReasonNameModule(reason.clearName || reason.moduleName, by)}`
        ] = subReasons;
      }

      return acc;
    },
    {}
  );

  if (reasonsSubSet.length < reasons.length) {
    tree[dim(`... ${reasons.length - limit} more`)] = "null";
  }

  return printTree(tree);
};

const printLocations = (locations: Array<string>) =>
  printTree(
    locations.reduce<treeify.TreeObject>((acc, loc: string) => {
      acc[loc] = "null";
      return acc;
    }, {})
  );

const printIncludedFiles = (files: Array<string>, limit: number) => {
  const filesSubset = takeSubset(files, limit);
  const tree = filesSubset.reduce<treeify.TreeObject>((acc, file) => {
    acc[file] = "null";
    return acc;
  }, {});

  if (filesSubset.length < files.length) {
    tree[dim(`... ${files.length - limit} more`)] = "null";
  }

  return printTree(tree);
};

const printType = (module: Module, limit: number, by?: string) => {
  const type = [
    `├─ ${magenta("type")}: ${
      module.depsType === "direct" ? directBadge() : transitiveBadge()
    }`,
  ];

  if (module.depsType === "transitive") {
    const depsChainsSubset = takeSubset(module.depsChains, limit);
    const depsChains = depsChainsSubset.reduce<treeify.TreeObject>(
      (acc, chain) => {
        acc[
          `${module.name} ${dim("->")} ${chain
            .map((dep) => (dep === by ? cyanBadge(` ${dep} `) : dep))
            .join(dim(" -> "))}`
        ] = "null";
        return acc;
      },
      {}
    );

    if (depsChainsSubset.length < module.depsChains.length) {
      depsChains[dim(`... ${module.depsChains.length - limit} more`)] = "null";
    }

    type.push(indent(printTree(depsChains)).join("\n"));
  }

  return type;
};

const printSize = (size: number, mod = false) => {
  const sizeInKiB = Math.ceil(size / 1024);
  const level =
    sizeInKiB === 0
      ? "unknown"
      : sizeInKiB > 20
      ? "red"
      : sizeInKiB < 20 && sizeInKiB > 10
      ? "yellow"
      : "default";
  const levelColor = {
    red: red,
    yellow: yellow,
  };
  const sizeFormatted =
    level === "unknown"
      ? dim("unknown")
      : level === "default"
      ? sizeInKiB + " KiB"
      : levelColor[level](sizeInKiB + " KiB");
  return `${magenta("size")}: ${sizeFormatted}${
    mod ? dim(" [for all included files]") : ""
  }`;
};

const printChunkInfo = (module: Module, chunks: Chunks) => {
  return module.chunks.reduce<Array<string>>((acc, chunkId) => {
    const chunk = chunks[chunkId];
    if (!chunk) return acc;
    acc =
      chunk.names && chunk.names.length
        ? acc.concat(chunk.names)
        : acc.concat("" + chunk.id);
    return acc;
  }, []);
};

const printFile = (
  module: Module,
  chunks: Chunks,
  limit: number,
  by?: string
) => {
  const chunksInfo = printChunkInfo(module, chunks);
  const entry = isEntry(module.reasons);
  return [
    `${fileBadge()} ${green(module.name)}${
      entry ? " " + entryPointBadge() : ""
    }`,
    `├─ ${magenta("imported")}: ${printImportedCount(module.imported)}`,
    `├─ ${printSize(module.size)}`,
    chunksInfo &&
      chunksInfo.length &&
      `${entry ? "└─" : "├─"} ${magenta("chunks")}: ${chunksInfo.join(", ")}`,
    !entry && `└─ ${magenta("reasons")}:`,
    !entry && indent(printReasons(module.reasons, limit, by), " ").join("\n"),
  ].filter((msg) => !!msg);
};

const printModule = (
  module: Module,
  chunks: Chunks,
  limit: number,
  by?: string
) => {
  const chunksInfo = printChunkInfo(module, chunks);
  const entry = isEntry(module.reasons);
  return [
    `${moduleBadge()} ${yellow(module.name)}${
      entry ? " " + entryPointBadge() : ""
    }`,
    `├─ ${magenta("imported")}: ${printImportedCount(module.imported)}`,
    `├─ ${magenta("deps count")}: ${module.deps}`,
    `├─ ${printSize(module.size, true)}`,
    printType(module, limit, by).join("\n"),
    chunksInfo &&
      chunksInfo.length &&
      `├─ ${magenta("chunks")}: ${chunksInfo.join(", ")}`,
    `├─ ${magenta("locations")}: ${
      module.locations.length > 1 ? redBadge("multiple") : ""
    }`,
    indent(printLocations(module.locations)).join("\n"),
    `${entry ? "└─" : "├─"} ${magenta("files")}: `,
    indent(printIncludedFiles(module.filesIncluded, limit)).join("\n"),
    !entry && `└─ ${magenta("reasons")}:`,
    !entry && indent(printReasons(module.reasons, limit, by), " ").join("\n"),
  ].filter((msg) => !!msg);
};

export function print(
  report: Array<Module>,
  chunks: Chunks,
  flags: { by?: string },
  limit: number,
  logger: (msg?: string) => void = console.log
) {
  report
    .filter((module) => module.imported > 0)
    .forEach((module) => {
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
}

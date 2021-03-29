import type { Module } from "../../lib/analyze";

export function sortModules(
  modules: Array<Module>,
  maybeKey: string,
  order: string = "asc"
) {
  const allowedKeys = new Set(["size", "imported"]);
  if (!allowedKeys.has(maybeKey)) {
    return sortDefault(modules);
  }

  const key = maybeKey as keyof Module;

  switch (order) {
    case "asc":
      return sortAscByKey(modules, key);

    case "desc":
      return sortDescByKey(modules, key);

    default:
      return sortDefault(modules);
  }
}

function sortAscByKey(arr: Array<Module>, key: keyof Module) {
  arr.sort((a, b) => (a[key] > b[key] ? 1 : a[key] === b[key] ? 0 : -1));
}

function sortDescByKey(arr: Array<Module>, key: keyof Module) {
  arr.sort((a, b) => (a[key] > b[key] ? -1 : a[key] === b[key] ? 0 : 1));
}

export function sortDefault(arr: Array<Module>) {
  arr.sort((a, b) => b.imported - a.imported);
}

import type { WebpackModule } from "./analyze";

function has<T extends object>(obj: T) {
  return function (prop: string) {
    return obj.hasOwnProperty(prop);
  };
}

function isValidModule(sample: WebpackModule) {
  const isProp = has(sample);
  if (!isProp("reasons")) return false;
  return true;
}

export function vlidateStatsJson(modules: Array<WebpackModule>): boolean {
  const samples = modules.slice(0, 10);
  return samples.some(isValidModule);
}

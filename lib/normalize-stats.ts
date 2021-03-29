import type { WebpackStats, NormalizedWebpackStats, Chunks } from "./analyze";

export function normalizeStats(stats: WebpackStats): NormalizedWebpackStats {
  let modules = new Map();
  let chunks: Chunks = {};

  (stats.chunks || []).forEach((chunk) => {
    chunks[chunk.id] = {
      id: chunk.id,
      names: chunk.names,
      size: chunk.size,
    };

    (chunk.modules || []).forEach((m) => {
      modules.set(m.id, m);
    });
  });

  (stats.modules || []).forEach((m) => {
    modules.set(m.id, m);
  });

  (stats.children || []).forEach((child) => {
    let normalizedChild = normalizeStats(child);
    chunks = Object.assign({}, { ...chunks, ...normalizedChild.chunks });
    normalizedChild.modules.forEach((m) => {
      modules.set(m.id, m);
    });
  });

  return { modules: Array.from(modules.values()), chunks };
}
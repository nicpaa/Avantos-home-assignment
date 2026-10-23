import { directDependenciesSource } from "./directDependencies";
import { globalDataSource } from "./globalData";
import { transitiveDependenciesSource } from "./transitiveDependencies";
import type { DataSource } from "./types";

/**
 * Every built-in prefill data source, in default display order. The single extension
 * point: to add a source, implement `DataSource` and append it here.
 */
export const availableDataSources: readonly DataSource[] = [
  directDependenciesSource,
  transitiveDependenciesSource,
  globalDataSource,
];

/**
 * Picks the sources to use from a comma-separated id list (e.g. the `VITE_DATA_SOURCES`
 * setting), in the listed order, so any combination is configuration, not code.
 * No list means every source. An unknown id throws instead of silently showing less.
 */
export function selectDataSources(
  catalog: readonly DataSource[],
  idList?: string,
): readonly DataSource[] {
  const ids = (idList ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id !== "");
  if (ids.length === 0) return catalog;

  return ids.map((id) => {
    const source = catalog.find((candidate) => candidate.id === id);
    if (!source) {
      const valid = catalog.map((candidate) => candidate.id).join(", ");
      throw new Error(`Unknown data source "${id}". Valid ids: ${valid}.`);
    }
    return source;
  });
}

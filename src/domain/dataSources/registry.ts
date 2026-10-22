import { directDependenciesSource } from "./directDependencies";
import { globalDataSource } from "./globalData";
import { transitiveDependenciesSource } from "./transitiveDependencies";
import type { DataSource } from "./types";

/**
 * Active prefill data sources, in display order. The single extension point:
 * to add a source, implement `DataSource` and append it here. Nothing else changes.
 */
export const dataSources: readonly DataSource[] = [
  directDependenciesSource,
  transitiveDependenciesSource,
  globalDataSource,
];

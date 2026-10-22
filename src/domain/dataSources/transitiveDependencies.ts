import { getTransitiveDependencyIds } from "../graph/traversal";
import { formFieldGroups } from "./formFieldGroups";
import type { DataSource } from "./types";

/** Fields of the forms further upstream (direct dependencies are listed by their own source). */
export const transitiveDependenciesSource: DataSource = {
  id: "transitive-dependencies",
  label: "Transitive dependencies",
  getOptions: ({ graph, targetNodeId }) =>
    formFieldGroups(graph, getTransitiveDependencyIds(graph, targetNodeId)),
};

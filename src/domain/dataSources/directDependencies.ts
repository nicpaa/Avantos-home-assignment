import { getDirectDependencyIds } from "../graph/traversal";
import { formFieldGroups } from "./formFieldGroups";
import type { DataSource } from "./types";

/** Fields of the forms the target depends on directly. */
export const directDependenciesSource: DataSource = {
  id: "direct-dependencies",
  label: "Direct dependencies",
  getOptions: ({ graph, targetNodeId }) =>
    formFieldGroups(graph, getDirectDependencyIds(graph, targetNodeId)),
};

import type { BlueprintGraph } from "../../api/types";
import { getFormForNode, getPrefillableFields } from "../graph/forms";
import type { DataSourceGroup } from "./types";

/** One group per upstream node, listing its form's prefillable fields. Shared by the graph-based sources. */
export function formFieldGroups(
  graph: BlueprintGraph,
  nodeIds: string[],
): DataSourceGroup[] {
  return nodeIds.flatMap((nodeId) => {
    const node = graph.nodes.find((candidate) => candidate.id === nodeId);
    const form = getFormForNode(graph, nodeId);
    if (!node || !form) return [];

    const options = getPrefillableFields(form).map((field) => ({
      key: `${nodeId}:${field}`,
      label: field,
    }));
    return options.length > 0 ? [{ id: nodeId, label: node.data.name, options }] : [];
  });
}

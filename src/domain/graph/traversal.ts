import type { BlueprintGraph, GraphNode } from "../../api/types";

function indexNodesById(graph: BlueprintGraph): Map<string, GraphNode> {
  return new Map(graph.nodes.map((node) => [node.id, node]));
}

/** Nodes the given node depends on directly, in payload order. Unknown id → []. */
export function getDirectDependencyIds(graph: BlueprintGraph, nodeId: string): string[] {
  const node = graph.nodes.find((candidate) => candidate.id === nodeId);
  return node ? [...node.data.prerequisites] : [];
}

/**
 * Ancestors that are not direct dependencies, nearest first (breadth-first), each once.
 * Direct ones are excluded so every upstream form appears under exactly one source.
 * A valid blueprint is acyclic, but `visited` keeps a malformed one from looping forever.
 */
export function getTransitiveDependencyIds(
  graph: BlueprintGraph,
  nodeId: string,
): string[] {
  const nodesById = indexNodesById(graph);
  const direct = new Set(getDirectDependencyIds(graph, nodeId));
  const visited = new Set<string>([nodeId]);
  const queue = [...direct];
  const result: string[] = [];

  // Walk by index instead of shift(): O(1) per step, and `id` is narrowed without `!`.
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    if (id === undefined || visited.has(id)) continue;
    visited.add(id);
    if (!direct.has(id)) result.push(id);
    queue.push(...(nodesById.get(id)?.data.prerequisites ?? []));
  }

  return result;
}

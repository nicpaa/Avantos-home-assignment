import type { BlueprintGraph, GraphNode, Position } from "../../api/types";

export const NODE_WIDTH = 168;
export const NODE_HEIGHT = 56;
const PADDING = 24;
const COLUMN_GAP = 300;
const ROW_GAP = 100;

export interface PositionedNode {
  node: GraphNode;
  /** Top-left corner inside the drawing, in pixels. */
  x: number;
  y: number;
}

export interface GraphEdgeLayout {
  id: string;
  /** SVG path from the parent's right edge to the child's left edge. */
  path: string;
}

export interface GraphLayout {
  width: number;
  height: number;
  nodes: PositionedNode[];
  edges: GraphEdgeLayout[];
}

interface PlacedNode {
  node: GraphNode;
  position: Position;
}

/**
 * Places nodes at the positions saved by the Avantos editor (or by depth when some are
 * missing), shifted so the drawing starts at the top-left, and connects each
 * prerequisite to its dependant.
 */
export function layoutGraph(graph: BlueprintGraph): GraphLayout {
  if (graph.nodes.length === 0) return { width: 0, height: 0, nodes: [], edges: [] };

  const placed = placeNodes(graph);
  const xs = placed.map(({ position }) => position.x);
  const ys = placed.map(({ position }) => position.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);

  const nodes = placed.map(({ node, position }) => ({
    node,
    x: position.x - minX + PADDING,
    y: position.y - minY + PADDING,
  }));
  const byId = new Map(nodes.map((positioned) => [positioned.node.id, positioned]));

  const edges = nodes.flatMap((child) =>
    child.node.data.prerequisites.flatMap((parentId) => {
      const parent = byId.get(parentId);
      if (!parent) return [];
      return [{ id: `${parentId}->${child.node.id}`, path: connect(parent, child) }];
    }),
  );

  return {
    width: Math.max(...xs) - minX + NODE_WIDTH + 2 * PADDING,
    height: Math.max(...ys) - minY + NODE_HEIGHT + 2 * PADDING,
    nodes,
    edges,
  };
}

/**
 * Editor positions when every node has one. Mixing them with computed ones could
 * overlap, so a single missing position switches the whole graph to the depth layout.
 */
function placeNodes(graph: BlueprintGraph): PlacedNode[] {
  const fromEditor = graph.nodes.flatMap((node) =>
    node.position ? [{ node, position: node.position }] : [],
  );
  return fromEditor.length === graph.nodes.length ? fromEditor : placeByDepth(graph);
}

/**
 * Column = longest path from a root, so every form sits right of all its prerequisites;
 * row = order within the column. Unknown parents and cycles are ignored.
 */
function placeByDepth(graph: BlueprintGraph): PlacedNode[] {
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const depths = new Map<string, number>();

  function depthOf(id: string, path: Set<string>): number {
    const known = depths.get(id);
    if (known !== undefined) return known;
    const node = nodesById.get(id);
    if (!node || path.has(id)) return -1;
    path.add(id);
    const parentDepths = node.data.prerequisites.map((parentId) =>
      depthOf(parentId, path),
    );
    path.delete(id);
    const depth = Math.max(-1, ...parentDepths) + 1;
    depths.set(id, depth);
    return depth;
  }

  const rowsUsed = new Map<number, number>();
  return graph.nodes.map((node) => {
    const depth = depthOf(node.id, new Set());
    const row = rowsUsed.get(depth) ?? 0;
    rowsUsed.set(depth, row + 1);
    return { node, position: { x: depth * COLUMN_GAP, y: row * ROW_GAP } };
  });
}

/** Horizontal S-curve, like the edges in the Avantos editor. */
function connect(from: PositionedNode, to: PositionedNode): string {
  const startX = from.x + NODE_WIDTH;
  const startY = from.y + NODE_HEIGHT / 2;
  const endX = to.x;
  const endY = to.y + NODE_HEIGHT / 2;
  const bend = (endX - startX) / 2;
  return `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`;
}

import type { BlueprintGraph, GraphNode } from "../../api/types";

export const NODE_WIDTH = 168;
export const NODE_HEIGHT = 56;
const PADDING = 24;

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

/**
 * Places nodes at the positions saved by the Avantos editor, shifted so the drawing
 * starts at the top-left, and connects each prerequisite to its dependant.
 */
export function layoutGraph(graph: BlueprintGraph): GraphLayout {
  if (graph.nodes.length === 0) return { width: 0, height: 0, nodes: [], edges: [] };

  const xs = graph.nodes.map((node) => node.position.x);
  const ys = graph.nodes.map((node) => node.position.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);

  const nodes = graph.nodes.map((node) => ({
    node,
    x: node.position.x - minX + PADDING,
    y: node.position.y - minY + PADDING,
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

/** Horizontal S-curve, like the edges in the Avantos editor. */
function connect(from: PositionedNode, to: PositionedNode): string {
  const startX = from.x + NODE_WIDTH;
  const startY = from.y + NODE_HEIGHT / 2;
  const endX = to.x;
  const endY = to.y + NODE_HEIGHT / 2;
  const bend = (endX - startX) / 2;
  return `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`;
}

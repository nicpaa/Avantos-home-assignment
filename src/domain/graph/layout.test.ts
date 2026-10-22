import type { BlueprintGraph } from "../../api/types";
import { blueprintGraph, NODE_IDS } from "../../test/fixtures/graph";
import { layoutGraph, NODE_HEIGHT, NODE_WIDTH } from "./layout";

const { FORM_A, FORM_B, FORM_C, FORM_D, FORM_E, FORM_F } = NODE_IDS;

describe("layoutGraph", () => {
  const layout = layoutGraph(blueprintGraph);

  function positionOf(id: string) {
    const positioned = layout.nodes.find((candidate) => candidate.node.id === id);
    return positioned && { x: positioned.x, y: positioned.y };
  }

  it("shifts the drawing so the leftmost and topmost nodes sit at the padding", () => {
    // A is leftmost (x 494), B is topmost (y 155).
    expect(positionOf(FORM_A)).toEqual({ x: 24, y: 24 + (269 - 155) });
    expect(positionOf(FORM_B)).toEqual({ x: 24 + (781 - 494), y: 24 });
  });

  it("sizes the drawing to fit every node", () => {
    expect(layout.width).toBe(1437 - 494 + NODE_WIDTH + 48);
    expect(layout.height).toBe(362 - 155 + NODE_HEIGHT + 48);
  });

  it("draws one edge per prerequisite", () => {
    expect(layout.edges.map((edge) => edge.id).sort()).toEqual(
      [
        `${FORM_A}->${FORM_B}`,
        `${FORM_A}->${FORM_C}`,
        `${FORM_B}->${FORM_D}`,
        `${FORM_C}->${FORM_E}`,
        `${FORM_D}->${FORM_F}`,
        `${FORM_E}->${FORM_F}`,
      ].sort(),
    );
  });

  it("runs an edge from the parent's right edge to the child's left edge", () => {
    // A sits at (24, 138), B at (311, 24): start (24 + 168, 138 + 28), end (311, 24 + 28).
    const edge = layout.edges.find(
      (candidate) => candidate.id === `${FORM_A}->${FORM_B}`,
    );
    expect(edge?.path).toBe("M 192 166 C 251.5 166, 251.5 52, 311 52");
  });

  it("skips prerequisites that point to unknown nodes", () => {
    const graph: BlueprintGraph = {
      forms: [],
      nodes: [
        {
          id: "X",
          position: { x: 0, y: 0 },
          data: { name: "X", component_id: "f", prerequisites: ["missing"] },
        },
      ],
    };
    expect(layoutGraph(graph).edges).toEqual([]);
  });

  it("returns an empty drawing for an empty graph", () => {
    expect(layoutGraph({ nodes: [], forms: [] })).toEqual({
      width: 0,
      height: 0,
      nodes: [],
      edges: [],
    });
  });
});

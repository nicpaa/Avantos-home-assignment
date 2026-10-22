import { blueprintGraph } from "../test/fixtures/graph";
import { isBlueprintGraph } from "./guards";

describe("isBlueprintGraph", () => {
  it("accepts a valid graph", () => {
    expect(isBlueprintGraph(blueprintGraph)).toBe(true);
  });

  it("ignores fields the app does not use", () => {
    const withExtras = { ...blueprintGraph, edges: [], branches: [], name: "Onboard" };
    expect(isBlueprintGraph(withExtras)).toBe(true);
  });

  it("accepts nodes without a position", () => {
    const node = { id: "a", data: { name: "A", component_id: "f", prerequisites: [] } };
    expect(isBlueprintGraph({ nodes: [node], forms: [] })).toBe(true);
  });

  it.each([
    ["null", null],
    ["an array", []],
    ["missing nodes", { forms: [] }],
    ["missing forms", { nodes: [] }],
    [
      "prerequisites that are not strings",
      {
        nodes: [
          {
            id: "a",
            position: { x: 0, y: 0 },
            data: { name: "A", component_id: "f", prerequisites: [1] },
          },
        ],
        forms: [],
      },
    ],
    [
      "a position that isn't numbers",
      {
        nodes: [
          {
            id: "a",
            position: { x: "0", y: 0 },
            data: { name: "A", component_id: "f", prerequisites: [] },
          },
        ],
        forms: [],
      },
    ],
    [
      "a field without avantos_type",
      { nodes: [], forms: [{ id: "f", field_schema: { properties: { email: {} } } }] },
    ],
  ])("rejects %s", (_, value) => {
    expect(isBlueprintGraph(value)).toBe(false);
  });
});

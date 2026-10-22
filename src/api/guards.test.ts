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

  it.each([
    ["null", null],
    ["an array", []],
    ["missing nodes", { forms: [] }],
    ["missing forms", { nodes: [] }],
    [
      "prerequisites that are not strings",
      {
        nodes: [{ id: "a", data: { name: "A", component_id: "f", prerequisites: [1] } }],
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

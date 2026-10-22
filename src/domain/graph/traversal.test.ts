import type { BlueprintGraph } from "../../api/types";
import { blueprintGraph, NODE_IDS } from "../../test/fixtures/graph";
import { getDirectDependencyIds, getTransitiveDependencyIds } from "./traversal";

const { FORM_A, FORM_B, FORM_C, FORM_D, FORM_E, FORM_F } = NODE_IDS;

describe("getDirectDependencyIds", () => {
  it("returns nothing for a root form", () => {
    expect(getDirectDependencyIds(blueprintGraph, FORM_A)).toEqual([]);
  });

  it("returns the immediate prerequisites", () => {
    expect(getDirectDependencyIds(blueprintGraph, FORM_D)).toEqual([FORM_B]);
    expect(getDirectDependencyIds(blueprintGraph, FORM_F)).toEqual([FORM_D, FORM_E]);
  });

  it("returns nothing for an unknown node", () => {
    expect(getDirectDependencyIds(blueprintGraph, "missing")).toEqual([]);
  });
});

describe("getTransitiveDependencyIds", () => {
  it("returns nothing for a root form", () => {
    expect(getTransitiveDependencyIds(blueprintGraph, FORM_A)).toEqual([]);
  });

  it("returns ancestors beyond the direct ones", () => {
    expect(getTransitiveDependencyIds(blueprintGraph, FORM_D)).toEqual([FORM_A]);
  });

  it("lists a diamond ancestor once, nearest first", () => {
    expect(getTransitiveDependencyIds(blueprintGraph, FORM_F)).toEqual([
      FORM_B,
      FORM_C,
      FORM_A,
    ]);
  });

  it("returns nothing for an unknown node", () => {
    expect(getTransitiveDependencyIds(blueprintGraph, "missing")).toEqual([]);
  });

  it("terminates on a cycle and never lists the node itself", () => {
    // X depends on Y, Y on Z, Z on X.
    const node = (id: string, parent: string) => ({
      id,
      position: { x: 0, y: 0 },
      data: { name: id, component_id: "f", prerequisites: [parent] },
    });
    const cyclic: BlueprintGraph = {
      forms: [],
      nodes: [node("X", "Y"), node("Y", "Z"), node("Z", "X")],
    };
    expect(getTransitiveDependencyIds(cyclic, "X")).toEqual(["Z"]);
  });
});

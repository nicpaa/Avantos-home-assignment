import { blueprintGraph, NODE_IDS } from "../../test/fixtures/graph";
import { globalDataSource } from "./globalData";

describe("globalDataSource", () => {
  it("offers the same global groups for every node", () => {
    const forA = globalDataSource.getOptions({
      graph: blueprintGraph,
      targetNodeId: NODE_IDS.FORM_A,
    });
    const forF = globalDataSource.getOptions({
      graph: blueprintGraph,
      targetNodeId: NODE_IDS.FORM_F,
    });

    expect(forA.map((group) => group.label)).toEqual([
      "Action Properties",
      "Client Organisation Properties",
    ]);
    expect(forF).toEqual(forA);
  });

  it("gives every option a unique key", () => {
    const keys = globalDataSource
      .getOptions({ graph: blueprintGraph, targetNodeId: NODE_IDS.FORM_A })
      .flatMap((group) => group.options.map((option) => option.key));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

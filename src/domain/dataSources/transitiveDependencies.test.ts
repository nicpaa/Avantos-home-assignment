import { blueprintGraph, NODE_IDS } from "../../test/fixtures/graph";
import { transitiveDependenciesSource } from "./transitiveDependencies";

const { FORM_A, FORM_B, FORM_C, FORM_D, FORM_F } = NODE_IDS;

function getOptions(targetNodeId: string) {
  return transitiveDependenciesSource.getOptions({ graph: blueprintGraph, targetNodeId });
}

describe("transitiveDependenciesSource", () => {
  it("offers the fields of forms beyond the direct dependencies", () => {
    expect(getOptions(FORM_D)).toEqual([
      {
        id: FORM_A,
        label: "Form A",
        options: [
          { key: `${FORM_A}:email`, label: "email" },
          { key: `${FORM_A}:name`, label: "name" },
          { key: `${FORM_A}:notes`, label: "notes" },
        ],
      },
    ]);
  });

  it("lists each ancestor once, nearest first", () => {
    expect(getOptions(FORM_F).map((group) => group.id)).toEqual([FORM_B, FORM_C, FORM_A]);
  });

  it("offers nothing when there are only direct dependencies", () => {
    expect(getOptions(FORM_B)).toEqual([]);
  });
});

import { blueprintGraph, NODE_IDS } from "../../test/fixtures/graph";
import { directDependenciesSource } from "./directDependencies";

const { FORM_A, FORM_B, FORM_D, FORM_E, FORM_F } = NODE_IDS;

function getOptions(targetNodeId: string) {
  return directDependenciesSource.getOptions({ graph: blueprintGraph, targetNodeId });
}

describe("directDependenciesSource", () => {
  it("offers the fields of each direct dependency, without buttons", () => {
    expect(getOptions(FORM_D)).toEqual([
      {
        id: FORM_B,
        label: "Form B",
        options: [
          { key: `${FORM_B}:email`, label: "email" },
          { key: `${FORM_B}:name`, label: "name" },
          { key: `${FORM_B}:notes`, label: "notes" },
        ],
      },
    ]);
  });

  it("returns one group per direct dependency", () => {
    expect(getOptions(FORM_F).map((group) => group.id)).toEqual([FORM_D, FORM_E]);
  });

  it("offers nothing for a root form", () => {
    expect(getOptions(FORM_A)).toEqual([]);
  });
});

import { blueprintGraph, FORM_IDS, NODE_IDS } from "../../test/fixtures/graph";
import { getFormForNode, getPrefillableFields } from "./forms";

describe("getFormForNode", () => {
  it("resolves a node to its form, including shared forms", () => {
    expect(getFormForNode(blueprintGraph, NODE_IDS.FORM_D)?.id).toBe(FORM_IDS.SHARED);
    expect(getFormForNode(blueprintGraph, NODE_IDS.FORM_B)?.id).toBe(FORM_IDS.B);
  });

  it("returns undefined for an unknown node", () => {
    expect(getFormForNode(blueprintGraph, "missing")).toBeUndefined();
  });
});

describe("getPrefillableFields", () => {
  it("returns data fields and skips buttons", () => {
    const form = getFormForNode(blueprintGraph, NODE_IDS.FORM_A);
    expect(form && getPrefillableFields(form)).toEqual(["email", "name", "notes"]);
  });
});

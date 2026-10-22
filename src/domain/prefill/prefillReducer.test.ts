import { NODE_IDS } from "../../test/fixtures/graph";
import { prefillReducer } from "./prefillReducer";
import type { PrefillMapping, PrefillState } from "./types";

const { FORM_A, FORM_D } = NODE_IDS;

const fromAEmail: PrefillMapping = {
  sourceId: "direct",
  optionKey: `${FORM_A}:email`,
  label: "Form A.email",
};
const fromAName: PrefillMapping = {
  sourceId: "direct",
  optionKey: `${FORM_A}:name`,
  label: "Form A.name",
};

describe("prefillReducer", () => {
  it("sets a mapping for a field", () => {
    const state = prefillReducer(
      {},
      {
        type: "set",
        nodeId: FORM_D,
        field: "email",
        mapping: fromAEmail,
      },
    );
    expect(state).toEqual({ [FORM_D]: { email: fromAEmail } });
  });

  it("overwrites an existing mapping and keeps other fields", () => {
    const initial: PrefillState = { [FORM_D]: { email: fromAEmail, notes: fromAEmail } };
    const state = prefillReducer(initial, {
      type: "set",
      nodeId: FORM_D,
      field: "email",
      mapping: fromAName,
    });
    expect(state).toEqual({ [FORM_D]: { email: fromAName, notes: fromAEmail } });
  });

  it("clears a mapping", () => {
    const initial: PrefillState = { [FORM_D]: { email: fromAEmail, notes: fromAEmail } };
    const state = prefillReducer(initial, {
      type: "clear",
      nodeId: FORM_D,
      field: "email",
    });
    expect(state).toEqual({ [FORM_D]: { notes: fromAEmail } });
  });

  it("returns the same state when clearing something that isn't mapped", () => {
    const initial: PrefillState = { [FORM_D]: { email: fromAEmail } };
    expect(
      prefillReducer(initial, { type: "clear", nodeId: FORM_D, field: "name" }),
    ).toBe(initial);
    expect(
      prefillReducer(initial, { type: "clear", nodeId: FORM_A, field: "email" }),
    ).toBe(initial);
  });

  it("keeps nodes that share a form independent", () => {
    // A and D render the same form; mapping D must not touch A.
    const initial: PrefillState = { [FORM_A]: { email: fromAName } };
    const state = prefillReducer(initial, {
      type: "set",
      nodeId: FORM_D,
      field: "email",
      mapping: fromAEmail,
    });
    expect(state[FORM_A]).toEqual({ email: fromAName });
  });

  it("does not mutate the previous state", () => {
    const initial: PrefillState = { [FORM_D]: { email: fromAEmail } };
    const snapshot = structuredClone(initial);
    prefillReducer(initial, {
      type: "set",
      nodeId: FORM_D,
      field: "name",
      mapping: fromAName,
    });
    prefillReducer(initial, { type: "clear", nodeId: FORM_D, field: "email" });
    expect(initial).toEqual(snapshot);
  });
});

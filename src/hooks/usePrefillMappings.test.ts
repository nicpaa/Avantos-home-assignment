import { act, renderHook } from "@testing-library/react";
import { NODE_IDS } from "../test/fixtures/graph";
import { usePrefillMappings } from "./usePrefillMappings";

const mapping = { sourceId: "direct", optionKey: "b:email", label: "Form B.email" };

describe("usePrefillMappings", () => {
  it("starts empty, then sets and clears a mapping", () => {
    const { result } = renderHook(() => usePrefillMappings());
    expect(result.current.mappings).toEqual({});

    act(() => result.current.setMapping(NODE_IDS.FORM_D, "email", mapping));
    expect(result.current.mappings).toEqual({ [NODE_IDS.FORM_D]: { email: mapping } });

    act(() => result.current.clearMapping(NODE_IDS.FORM_D, "email"));
    expect(result.current.mappings).toEqual({ [NODE_IDS.FORM_D]: {} });
  });
});

import { useReducer } from "react";
import { prefillReducer } from "../domain/prefill/prefillReducer";
import type { PrefillMapping } from "../domain/prefill/types";

/** Prefill state for all nodes, with intention-revealing setters instead of raw dispatch. */
export function usePrefillMappings() {
  const [mappings, dispatch] = useReducer(prefillReducer, {});

  function setMapping(nodeId: string, field: string, mapping: PrefillMapping) {
    dispatch({ type: "set", nodeId, field, mapping });
  }

  function clearMapping(nodeId: string, field: string) {
    dispatch({ type: "clear", nodeId, field });
  }

  return { mappings, setMapping, clearMapping };
}

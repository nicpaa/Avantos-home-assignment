import type { PrefillAction, PrefillState } from "./types";

export function prefillReducer(state: PrefillState, action: PrefillAction): PrefillState {
  switch (action.type) {
    case "set":
      return {
        ...state,
        [action.nodeId]: { ...state[action.nodeId], [action.field]: action.mapping },
      };
    case "clear": {
      const nodeMappings = state[action.nodeId];
      // Nothing to clear: keep the same reference so React can skip the re-render.
      if (!nodeMappings || !(action.field in nodeMappings)) return state;
      const remaining = Object.fromEntries(
        Object.entries(nodeMappings).filter(([field]) => field !== action.field),
      );
      return { ...state, [action.nodeId]: remaining };
    }
  }
}

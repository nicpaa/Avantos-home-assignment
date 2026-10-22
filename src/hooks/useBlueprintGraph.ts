import { useEffect, useState } from "react";
import { fetchBlueprintGraph } from "../api/client";
import type { BlueprintGraph } from "../api/types";

export type BlueprintGraphState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; graph: BlueprintGraph };

/** Loads the blueprint graph once; the request is aborted on unmount. */
export function useBlueprintGraph(): BlueprintGraphState {
  const [state, setState] = useState<BlueprintGraphState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    // After abort (unmount, or StrictMode's first effect run) nobody is listening anymore.
    fetchBlueprintGraph(controller.signal).then(
      (graph) => {
        if (!controller.signal.aborted) setState({ status: "ready", graph });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : String(error);
        setState({ status: "error", message });
      },
    );
    return () => controller.abort();
  }, []);

  return state;
}

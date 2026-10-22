import { isBlueprintGraph } from "./guards";
import type { BlueprintGraph } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
const TENANT_ID = import.meta.env.VITE_TENANT_ID ?? "1";
const BLUEPRINT_ID = import.meta.env.VITE_BLUEPRINT_ID ?? "bp_01jk766tckfwx84xjcxazggzyc";

/** URL of `action-blueprint-graph-get`. The mock server ignores both ids, a real backend won't. */
export function buildGraphUrl(): string {
  return `${API_BASE_URL}/api/v1/${TENANT_ID}/actions/blueprints/${BLUEPRINT_ID}/graph`;
}

export async function fetchBlueprintGraph(signal?: AbortSignal): Promise<BlueprintGraph> {
  const url = buildGraphUrl();

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (cause) {
    throw new Error(
      `Could not reach ${url}. Is the mock server running (npm start in frontendchallengeserver)?`,
      { cause },
    );
  }

  if (!response.ok) {
    throw new Error(`Loading the blueprint graph failed with status ${response.status}.`);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (cause) {
    throw new Error("The blueprint graph response is not valid JSON.", { cause });
  }

  if (!isBlueprintGraph(body)) {
    throw new Error("The blueprint graph response has an unexpected shape.");
  }
  return body;
}

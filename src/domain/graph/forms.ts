import type { BlueprintGraph, Form } from "../../api/types";

/** Form rendered by a node. Several nodes can share one form. */
export function getFormForNode(graph: BlueprintGraph, nodeId: string): Form | undefined {
  const node = graph.nodes.find((candidate) => candidate.id === nodeId);
  return graph.forms.find((form) => form.id === node?.data.component_id);
}

/** Keys of the fields that hold data. Buttons are actions, so they can't be prefilled. */
export function getPrefillableFields(form: Form): string[] {
  return Object.entries(form.field_schema.properties)
    .filter(([, field]) => field.avantos_type !== "button")
    .map(([key]) => key);
}

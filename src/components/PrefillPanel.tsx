import type { BlueprintGraph, GraphNode } from "../api/types";
import { getFormForNode, getPrefillableFields } from "../domain/graph/forms";
import type { PrefillMapping } from "../domain/prefill/types";
import { PrefillFieldRow } from "./PrefillFieldRow";

export interface PrefillPanelProps {
  graph: BlueprintGraph;
  node: GraphNode;
  /** Mappings of this node only, keyed by field. */
  mappings: Record<string, PrefillMapping>;
  onClear: (field: string) => void;
}

export function PrefillPanel({ graph, node, mappings, onClear }: PrefillPanelProps) {
  const form = getFormForNode(graph, node.id);
  const fields = form ? getPrefillableFields(form) : [];

  return (
    <section aria-label="Prefill">
      <h2>{node.data.name}</h2>
      <p>Prefill fields for this form</p>
      {fields.length === 0 ? (
        <p>This form has no fields to prefill.</p>
      ) : (
        <ul>
          {fields.map((field) => (
            <PrefillFieldRow
              key={field}
              field={field}
              mapping={mappings[field]}
              onClear={() => onClear(field)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

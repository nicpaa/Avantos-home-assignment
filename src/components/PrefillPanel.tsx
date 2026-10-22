import { useState } from "react";
import type { BlueprintGraph, GraphNode } from "../api/types";
import { getFormForNode, getPrefillableFields } from "../domain/graph/forms";
import type { DataSource } from "../domain/dataSources/types";
import type { PrefillMapping } from "../domain/prefill/types";
import { DataSourceModal } from "./DataSourceModal";
import { PrefillFieldRow } from "./PrefillFieldRow";

export interface PrefillPanelProps {
  graph: BlueprintGraph;
  node: GraphNode;
  /** Mappings of this node only, keyed by field. */
  mappings: Record<string, PrefillMapping>;
  sources: readonly DataSource[];
  onSet: (field: string, mapping: PrefillMapping) => void;
  onClear: (field: string) => void;
}

export function PrefillPanel({
  graph,
  node,
  mappings,
  sources,
  onSet,
  onClear,
}: PrefillPanelProps) {
  // Field whose source is being picked; the modal is open while it's set.
  const [editingField, setEditingField] = useState<string | null>(null);

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
              onOpen={() => setEditingField(field)}
              onClear={() => onClear(field)}
            />
          ))}
        </ul>
      )}
      {editingField !== null && (
        <DataSourceModal
          sources={sources}
          context={{ graph, targetNodeId: node.id }}
          onSelect={(mapping) => {
            onSet(editingField, mapping);
            setEditingField(null);
          }}
          onClose={() => setEditingField(null)}
        />
      )}
    </section>
  );
}

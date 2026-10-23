/**
 * Response of `action-blueprint-graph-get`, reduced to the fields the app uses.
 * The payload carries more (edges, ui_schema, sla_duration, ...); the guard ignores it.
 */
export interface BlueprintGraph {
  nodes: GraphNode[];
  forms: Form[];
}

/** Top-left corner on the editor canvas, in pixels. */
export interface Position {
  x: number;
  y: number;
}

export interface GraphNode {
  id: string;
  /** Saved by the Avantos editor. Optional: only the drawing needs it, prefill doesn't. */
  position?: Position;
  data: {
    /** Display name, e.g. "Form A". Forms themselves are all named "test form". */
    name: string;
    /** Id of the form this node renders. Several nodes can share one form. */
    component_id: string;
    /** Ids of the direct upstream nodes. Source of truth for the DAG (`edges` duplicates it). */
    prerequisites: string[];
  };
}

export interface Form {
  id: string;
  field_schema: {
    properties: Record<string, FormField>;
  };
}

export interface FormField {
  /** Avantos widget type, e.g. "short-text". "button" is an action, not data. */
  avantos_type: string;
}

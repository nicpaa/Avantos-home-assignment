import type { BlueprintGraph } from "../../api/types";

export interface DataSourceOption {
  /** Unique within its source; enough to resolve the value later. */
  key: string;
  label: string;
}

/** Options shown together under one heading, e.g. the fields of "Form A". */
export interface DataSourceGroup {
  id: string;
  label: string;
  options: DataSourceOption[];
}

/** Everything a source may need to compute its options; keeps sources pure. */
export interface DataSourceContext {
  graph: BlueprintGraph;
  /** The node whose field is being prefilled. */
  targetNodeId: string;
}

/** A provider of prefill options. Register new ones in `registry.ts`. */
export interface DataSource {
  /** Stable id, stored on every mapping created from this source. */
  id: string;
  /** Section heading in the selection modal. */
  label: string;
  getOptions(context: DataSourceContext): DataSourceGroup[];
}

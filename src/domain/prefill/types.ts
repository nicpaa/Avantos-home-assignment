/** Where a field's value comes from. */
export interface PrefillMapping {
  /** Id of the data source that produced the option. */
  sourceId: string;
  /** Option key, unique within its source. */
  optionKey: string;
  /** Shown in the field row, e.g. "Form A.email". */
  label: string;
}

/** nodeId → field → mapping. Keyed by node, not form: several nodes share one form. */
export type PrefillState = Record<string, Record<string, PrefillMapping>>;

export type PrefillAction =
  | { type: "set"; nodeId: string; field: string; mapping: PrefillMapping }
  | { type: "clear"; nodeId: string; field: string };

import type { DataSource, DataSourceGroup } from "./types";

// The payload has no global data, so these are static stand-ins for
// action- and client-level properties a real backend would provide.
const GLOBAL_FIELDS = [
  { id: "action", label: "Action Properties", fields: ["id", "name", "category"] },
  { id: "client", label: "Client Organisation Properties", fields: ["name", "email"] },
];

const groups: DataSourceGroup[] = GLOBAL_FIELDS.map(({ id, label, fields }) => ({
  id,
  label,
  options: fields.map((field) => ({ key: `global:${id}.${field}`, label: field })),
}));

/** Data that doesn't come from a form; the same for every target node. */
export const globalDataSource: DataSource = {
  id: "global-data",
  label: "Global data",
  getOptions: () => groups,
};

import type { DataSourceGroup } from "./types";

/**
 * Narrows groups to what matches the query, case-insensitively. A group whose label
 * matches keeps all its options ("form a" lists every field of Form A); otherwise only
 * matching options stay. Groups left empty are kept, the caller decides how to show them.
 */
export function searchGroups(
  groups: DataSourceGroup[],
  query: string,
): DataSourceGroup[] {
  const needle = query.trim().toLowerCase();
  if (needle === "") return groups;

  return groups.map((group) =>
    group.label.toLowerCase().includes(needle)
      ? group
      : {
          ...group,
          options: group.options.filter((option) =>
            option.label.toLowerCase().includes(needle),
          ),
        },
  );
}

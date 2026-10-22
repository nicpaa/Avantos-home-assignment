import { searchGroups } from "./search";
import type { DataSourceGroup } from "./types";

const groups: DataSourceGroup[] = [
  {
    id: "a",
    label: "Form A",
    options: [
      { key: "a:email", label: "email" },
      { key: "a:name", label: "name" },
    ],
  },
  {
    id: "client",
    label: "Client Organisation Properties",
    options: [{ key: "global:client.email", label: "email" }],
  },
];

function labels(result: DataSourceGroup[]) {
  return result.map((group) => [
    group.label,
    group.options.map((option) => option.label),
  ]);
}

describe("searchGroups", () => {
  it("returns the groups unchanged for an empty query", () => {
    expect(searchGroups(groups, "  ")).toBe(groups);
  });

  it("keeps options whose label matches, ignoring case", () => {
    expect(labels(searchGroups(groups, "EMA"))).toEqual([
      ["Form A", ["email"]],
      ["Client Organisation Properties", ["email"]],
    ]);
  });

  it("keeps every option of a group whose label matches", () => {
    expect(labels(searchGroups(groups, "form a"))).toEqual([
      ["Form A", ["email", "name"]],
      ["Client Organisation Properties", []],
    ]);
  });

  it("leaves groups empty when nothing matches", () => {
    expect(labels(searchGroups(groups, "zip"))).toEqual([
      ["Form A", []],
      ["Client Organisation Properties", []],
    ]);
  });
});

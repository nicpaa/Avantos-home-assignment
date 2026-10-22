import { dataSources } from "./registry";

describe("dataSources registry", () => {
  it("lists the built-in sources in display order", () => {
    expect(dataSources.map((source) => source.label)).toEqual([
      "Direct dependencies",
      "Transitive dependencies",
      "Global data",
    ]);
  });

  it("has unique source ids, since mappings store them", () => {
    const ids = dataSources.map((source) => source.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

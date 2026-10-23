import { availableDataSources, selectDataSources } from "./registry";

function labels(sources: ReturnType<typeof selectDataSources>) {
  return sources.map((source) => source.label);
}

describe("availableDataSources", () => {
  it("lists the built-in sources in display order", () => {
    expect(labels(availableDataSources)).toEqual([
      "Direct dependencies",
      "Transitive dependencies",
      "Global data",
    ]);
  });

  it("has unique source ids, since mappings store them", () => {
    const ids = availableDataSources.map((source) => source.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("selectDataSources", () => {
  it("uses every source when nothing is configured", () => {
    expect(selectDataSources(availableDataSources)).toBe(availableDataSources);
    expect(selectDataSources(availableDataSources, " ")).toBe(availableDataSources);
  });

  it("uses the listed sources in the listed order", () => {
    expect(
      labels(selectDataSources(availableDataSources, "global-data, direct-dependencies")),
    ).toEqual(["Global data", "Direct dependencies"]);
  });

  it("rejects an unknown id and names the valid ones", () => {
    expect(() => selectDataSources(availableDataSources, "direct, global-data")).toThrow(
      'Unknown data source "direct". Valid ids: direct-dependencies, transitive-dependencies, global-data.',
    );
  });
});

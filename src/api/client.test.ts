import { http, HttpResponse } from "msw";
import { blueprintGraph } from "../test/fixtures/graph";
import { server } from "../test/server";
import { buildGraphUrl, fetchBlueprintGraph } from "./client";

function respondWith(resolver: () => Response) {
  server.use(http.get(buildGraphUrl(), resolver));
}

describe("fetchBlueprintGraph", () => {
  it("returns the graph on success", async () => {
    respondWith(() => HttpResponse.json(blueprintGraph));
    await expect(fetchBlueprintGraph()).resolves.toEqual(blueprintGraph);
  });

  it("reports a non-OK status", async () => {
    respondWith(() => new HttpResponse(null, { status: 500 }));
    await expect(fetchBlueprintGraph()).rejects.toThrow("failed with status 500");
  });

  it("explains a network error and keeps the cause", async () => {
    respondWith(() => HttpResponse.error());
    await expect(fetchBlueprintGraph()).rejects.toMatchObject({
      message: expect.stringContaining("Is the mock server running"),
      cause: expect.anything(),
    });
  });

  it("rejects a body that is not JSON", async () => {
    respondWith(() => new HttpResponse("not json"));
    await expect(fetchBlueprintGraph()).rejects.toThrow("not valid JSON");
  });

  it("rejects a payload with an unexpected shape", async () => {
    respondWith(() => HttpResponse.json({ nodes: "nope" }));
    await expect(fetchBlueprintGraph()).rejects.toThrow("unexpected shape");
  });
});

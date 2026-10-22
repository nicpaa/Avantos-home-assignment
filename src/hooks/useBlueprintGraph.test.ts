import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { buildGraphUrl } from "../api/client";
import { blueprintGraph } from "../test/fixtures/graph";
import { server } from "../test/server";
import { useBlueprintGraph } from "./useBlueprintGraph";

describe("useBlueprintGraph", () => {
  it("starts loading, then returns the graph", async () => {
    const { result } = renderHook(() => useBlueprintGraph());
    expect(result.current).toEqual({ status: "loading" });
    await waitFor(() =>
      expect(result.current).toEqual({ status: "ready", graph: blueprintGraph }),
    );
  });

  it("returns the error message when loading fails", async () => {
    server.use(http.get(buildGraphUrl(), () => new HttpResponse(null, { status: 500 })));
    const { result } = renderHook(() => useBlueprintGraph());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current).toMatchObject({ message: expect.stringContaining("500") });
  });

  it("aborts the request on unmount", async () => {
    let request: Request | undefined;
    server.use(
      http.get(buildGraphUrl(), (info) => {
        request = info.request;
        return new Promise<never>(() => {}); // never responds
      }),
    );
    const { unmount } = renderHook(() => useBlueprintGraph());
    await waitFor(() => expect(request).toBeDefined());
    unmount();
    expect(request?.signal.aborted).toBe(true);
  });
});

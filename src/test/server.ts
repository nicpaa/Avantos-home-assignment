import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { buildGraphUrl } from "../api/client";
import { blueprintGraph } from "./fixtures/graph";

/** Default handlers live here; individual tests override with `server.use(...)`. */
export const server = setupServer(
  http.get(buildGraphUrl(), () => HttpResponse.json(blueprintGraph)),
);

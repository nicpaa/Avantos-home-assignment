import { setupServer } from "msw/node";

/** Default handlers live here; individual tests override with `server.use(...)`. */
export const server = setupServer();

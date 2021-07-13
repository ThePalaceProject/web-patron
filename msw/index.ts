import { setupServer } from "msw/node";

let mswServer = (undefined as unknown) as ReturnType<typeof setupServer>;

if (typeof window === "undefined") {
  const { server } = require("./server");
  server.listen();
  mswServer = server;
} else {
  const { worker } = require("./browser");
  worker.start();
  mswServer = worker;
}
export default mswServer;

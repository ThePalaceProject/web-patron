export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const http = await import("node:http");
    // Full URLs including query strings are logged. This app makes no inbound
    // or outbound requests expected to carry sensitive data in URLs.
    // Name checks guard against double-patching if register() is called more than once.
    if (http.Server.prototype.emit.name !== "patchedEmit") {
      const _emit = http.Server.prototype.emit;
      http.Server.prototype.emit = function patchedEmit(event, ...args) {
        if (event === "request") {
          const req = args[0] as import("http").IncomingMessage;
          const res = args[1] as import("http").ServerResponse;
          res.once("finish", () => {
            console.log(`recv ${req.method} ${req.url} ${res.statusCode}`);
          });
        }
        return _emit.apply(this, [event, ...args] as Parameters<typeof _emit>);
      };
    }

    if (globalThis.fetch?.name !== "loggedFetch") {
      const _fetch = globalThis.fetch;
      globalThis.fetch = async function loggedFetch(
        input: Parameters<typeof fetch>[0],
        init?: Parameters<typeof fetch>[1]
      ): Promise<Response> {
        const url = input instanceof Request ? input.url : String(input);
        const method = (
          init?.method ?? (input instanceof Request ? input.method : "GET")
        ).toUpperCase();
        const start = Date.now();
        try {
          const response = await _fetch(input, init);
          console.log(
            `send ${method} ${url} ${response.status} ${Date.now() - start}ms`
          );
          return response;
        } catch (err) {
          console.log(`send ${method} ${url} ERROR ${Date.now() - start}ms`);
          throw err;
        }
      };
    }

    const { getAppConfig } = await import("server/appConfig");
    try {
      await getAppConfig();
    } catch (e) {
      // Next.js does not exit on register() errors, so we must do it ourselves.
      console.error(e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  }
}

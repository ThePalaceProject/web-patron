import { parseBoolean } from "utils/envParse";
import { LANGUAGE_SELECTOR_FEATURE_FLAG_ENV } from "constants/env";

/*
 * When true, the request inputs that drive Next.js's automatic locale
 * detection (the NEXT_LOCALE cookie and the Accept-Language header) are
 * removed from every inbound request, so all patrons are served the default
 * (English) locale. This is how the language selector feature flag disables
 * locale detection at runtime: i18n config from next.config.js is baked into
 * the standalone build, so its localeDetection option cannot be driven by a
 * runtime environment variable. The cookie is only ignored, not cleared from
 * the browser, so a saved language choice resumes working when the flag is
 * enabled.
 */
let stripLocaleDetectionHeaders = false;

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    /*
     * The standalone server starts listening before register() finishes, so
     * the stripping flag is computed synchronously here, before the first
     * await, rather than only after the (possibly remote) config file has
     * been loaded. Requests that arrive mid-startup are then already served
     * with the correct behavior.
     */
    try {
      stripLocaleDetectionHeaders = !parseBoolean(
        LANGUAGE_SELECTOR_FEATURE_FLAG_ENV,
        false
      );
    } catch {
      // getAppConfig() below parses the same variable and exits on the error.
    }

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
          if (stripLocaleDetectionHeaders && req.headers) {
            delete req.headers["accept-language"];
            if (req.headers.cookie !== undefined) {
              const remaining = req.headers.cookie
                .split(";")
                .filter(pair => !pair.trimStart().startsWith("NEXT_LOCALE="));
              if (remaining.length > 0) {
                req.headers.cookie = remaining.join(";");
              } else {
                delete req.headers.cookie;
              }
            }
          }
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
    const { getLibraries } = await import("server/libraryRegistry");
    try {
      const appConfig = await getAppConfig();
      console.log(
        `OPDS 2 negotiation is ${appConfig.enableOpds2 ? "enabled" : "disabled"} (PALACE_CPW_FEATURE_OPDS2).`
      );
      console.log(
        `The language selector is ${appConfig.enableLanguageSelector ? "enabled" : "disabled"} (PALACE_CPW_FEATURE_LANGUAGE_SELECTOR).`
      );
      stripLocaleDetectionHeaders = !appConfig.enableLanguageSelector;
      /*
       * Pre-warm the registry cache before any requests are served.
       * getLibraries() sets pendingRefreshes synchronously before its first
       * await, so concurrent first-request handlers (including ISR
       * getStaticProps workers) find the in-progress crawl and coalesce onto
       * it via pendingRefreshes rather than starting independent duplicates.
       * Registry fetch errors are swallowed inside refreshRegistry, so this
       * call will not throw.
       */
      void getLibraries(appConfig);
    } catch (e) {
      // Next.js does not exit on register() errors, so we must do it ourselves.
      console.error(e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  }
}

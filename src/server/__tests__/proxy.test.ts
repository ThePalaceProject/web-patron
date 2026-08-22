/**
 * @jest-environment node
 *
 * Unit tests for src/proxy.ts. They live under server/__tests__ so they run
 * in the Node.js Jest project; the proxy itself must live at src/proxy.ts
 * for Next.js to pick it up.
 */

import { NextRequest } from "next/server";
import { proxy } from "../../proxy";

const I18N = {
  locales: ["en", "fr", "it", "de", "es"],
  defaultLocale: "en"
};

function makeRequest(path: string): NextRequest {
  return new NextRequest(`https://catalog.example.com${path}`, {
    nextConfig: { i18n: I18N }
  });
}

function redirectLocation(response: Response | undefined): URL {
  expect(response?.status).toBe(307);
  const location = response?.headers.get("location");
  expect(location).toBeTruthy();
  return new URL(location as string);
}

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe("proxy", () => {
  describe("when the language selector flag is off", () => {
    beforeEach(() => {
      delete process.env.PALACE_CPW_FEATURE_LANGUAGE_SELECTOR;
    });

    it("redirects a locale-prefixed path to the default locale", () => {
      const response = proxy(makeRequest("/es/library/books"));
      const location = redirectLocation(response);
      expect(location.host).toBe("catalog.example.com");
      expect(location.pathname).toBe("/library/books");
    });

    it.each(["fr", "it", "de", "es"])("redirects the /%s root to /", locale => {
      const response = proxy(makeRequest(`/${locale}`));
      expect(redirectLocation(response).pathname).toBe("/");
    });

    it("preserves the query string on redirect", () => {
      const response = proxy(makeRequest("/fr/search?q=dune&page=2"));
      const location = redirectLocation(response);
      expect(location.pathname).toBe("/search");
      expect(location.searchParams.get("q")).toBe("dune");
      expect(location.searchParams.get("page")).toBe("2");
    });

    it("does not redirect default-locale paths", () => {
      expect(proxy(makeRequest("/library/books"))).toBeUndefined();
    });

    it("does not redirect the root path", () => {
      expect(proxy(makeRequest("/"))).toBeUndefined();
    });
  });

  describe("when the language selector flag is on", () => {
    it.each(["true", "1", "on"])(
      "does not redirect locale-prefixed paths (flag value %s)",
      value => {
        process.env.PALACE_CPW_FEATURE_LANGUAGE_SELECTOR = value;
        expect(proxy(makeRequest("/es/library/books"))).toBeUndefined();
      }
    );
  });
});

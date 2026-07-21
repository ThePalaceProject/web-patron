/**
 * @jest-environment node
 *
 * Tests for the GET /api/catalog-url route.
 * Run under jest.config.node.js.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import type {
  CatalogUrlResponse,
  CatalogUrlErrorResponse
} from "pages/api/catalog-url";

// Mock both server modules so we can control their behavior.
jest.mock("server/libraryRegistry", () => ({
  getLibraries: jest.fn()
}));
jest.mock("server/appConfig", () => ({
  getAppConfig: jest.fn()
}));

import { getLibraries } from "server/libraryRegistry";
import { getAppConfig } from "server/appConfig";
import handler from "pages/api/catalog-url";
import { resetAuthDocCache } from "dataflow/getLibraryData";
import { config } from "test-utils/fixtures/config";
import { authDoc } from "test-utils/fixtures/auth-document";
import { expectAndSuppressConsole } from "test-utils/suppressConsole";

const mockGetLibraries = getLibraries as jest.MockedFunction<
  typeof getLibraries
>;
const mockGetAppConfig = getAppConfig as jest.MockedFunction<
  typeof getAppConfig
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeReq(
  query: Record<string, unknown>,
  method = "GET"
): NextApiRequest {
  return { query, method } as unknown as NextApiRequest;
}

function makeRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const setHeader = jest.fn();
  const res = { status, setHeader } as unknown as NextApiResponse<
    CatalogUrlResponse | CatalogUrlErrorResponse
  >;
  return { res, status, json, setHeader };
}

beforeEach(() => {
  resetAuthDocCache();
  mockGetAppConfig.mockResolvedValue(config);
  mockGetLibraries.mockResolvedValue({
    testlib: { title: "Test Library", authDocUrl: "http://auth.doc/document" }
  });
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => authDoc
  }) as unknown as typeof fetch;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /api/catalog-url", () => {
  test("returns the catalog root URL for a configured library", async () => {
    const { res, status, json } = makeRes();

    await handler(makeReq({ slug: "testlib" }), res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ catalogUrl: "/catalog-root" });
  });

  test("returns 405 for non-GET methods", async () => {
    const { res, status, json, setHeader } = makeRes();

    await handler(makeReq({ slug: "testlib" }, "POST"), res);

    expect(status).toHaveBeenCalledWith(405);
    expect(setHeader).toHaveBeenCalledWith("Allow", "GET");
    expect(json).toHaveBeenCalledWith({ error: "Method not allowed." });
  });

  test("returns 400 when the slug parameter is missing", async () => {
    const { res, status, json } = makeRes();

    await handler(makeReq({}), res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      error: "slug query parameter is required."
    });
  });

  test("returns 400 when the slug parameter is repeated", async () => {
    const { res, status } = makeRes();

    await handler(makeReq({ slug: ["a", "b"] }), res);

    expect(status).toHaveBeenCalledWith(400);
  });

  test("returns 404 for an unknown library", async () => {
    mockGetLibraries.mockResolvedValue({});
    const { res, status, json } = makeRes();

    await handler(makeReq({ slug: "nope" }), res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ error: "Library not found: nope" });
  });

  test("returns 500 when the auth document fetch fails", async () => {
    const errorSpy = expectAndSuppressConsole(
      "error",
      "GET /api/catalog-url failed:"
    );
    global.fetch = jest
      .fn()
      .mockRejectedValue(
        new Error("connection refused")
      ) as unknown as typeof fetch;
    const { res, status, json } = makeRes();

    await handler(makeReq({ slug: "testlib" }), res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      error: "Failed to resolve catalog URL."
    });
    errorSpy.mockRestore();
  });
});

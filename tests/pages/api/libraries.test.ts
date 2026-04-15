/**
 * @jest-environment node
 *
 * Tests for the GET /api/libraries route.
 * Run under jest.config.node.js.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import type {
  LibrariesResponse,
  LibrariesErrorResponse
} from "pages/api/libraries";

// Mock the registry module so we can control what getLibraries returns.
jest.mock("server/libraryRegistry", () => ({
  getLibraries: jest.fn()
}));

import { getLibraries } from "server/libraryRegistry";
import handler from "pages/api/libraries";

const mockGetLibraries = getLibraries as jest.MockedFunction<
  typeof getLibraries
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_APP_CONFIG = JSON.stringify({
  instanceName: "Test",
  gtmId: null,
  bugsnagApiKey: null,
  companionApp: "simplye",
  showMedium: true,
  openebooks: null,
  mediaSupport: {},
  libraries: {}
});

function makeRes() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const res = { status } as unknown as NextApiResponse<
    LibrariesResponse | LibrariesErrorResponse
  >;
  return { res, json };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /api/libraries", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, APP_CONFIG: VALID_APP_CONFIG };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 200 with an array of client-safe library objects", async () => {
    mockGetLibraries.mockResolvedValue({
      "uuid-abc": {
        id: "urn:uuid:abc",
        title: "Library A",
        authDocUrl: "https://a.example.com/auth"
      },
      "uuid-def": {
        id: "urn:uuid:def",
        title: "Library B",
        authDocUrl: "https://b.example.com/auth"
      }
    });

    const { res, json } = makeRes();
    await handler({} as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      libraries: expect.arrayContaining([
        {
          id: "urn:uuid:abc",
          slug: "uuid-abc",
          title: "Library A",
          authDocUrl: "https://a.example.com/auth"
        },
        {
          id: "urn:uuid:def",
          slug: "uuid-def",
          title: "Library B",
          authDocUrl: "https://b.example.com/auth"
        }
      ])
    });
  });

  it("returns an empty array when there are no libraries", async () => {
    mockGetLibraries.mockResolvedValue({});

    const { res, json } = makeRes();
    await handler({} as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ libraries: [] });
  });

  it("returns 500 when APP_CONFIG is not set", async () => {
    delete process.env.APP_CONFIG;

    const { res, json } = makeRes();
    await handler({} as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(json.mock.calls[0][0]).toMatchObject({
      error: expect.stringContaining("APP_CONFIG")
    });
  });

  it("returns 500 when APP_CONFIG is invalid JSON", async () => {
    process.env.APP_CONFIG = "not-valid-json{{{";

    const { res, json } = makeRes();
    await handler({} as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(json.mock.calls[0][0]).toMatchObject({
      error: expect.stringContaining("parsed")
    });
  });

  it("returns 500 when getLibraries throws", async () => {
    mockGetLibraries.mockRejectedValue(new Error("Registry unavailable"));

    const { res, json } = makeRes();
    await handler({} as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(json.mock.calls[0][0]).toMatchObject({
      error: expect.any(String)
    });
  });

  it("filters out undefined library entries", async () => {
    mockGetLibraries.mockResolvedValue({
      "uuid-valid": {
        id: "urn:uuid:valid",
        title: "Valid",
        authDocUrl: "https://v.example.com/auth"
      },
      "uuid-missing": undefined
    });

    const { res, json } = makeRes();
    await handler({} as NextApiRequest, res);

    const { libraries } = json.mock.calls[0][0] as LibrariesResponse;
    expect(libraries).toHaveLength(1);
    expect(libraries[0].id).toBe("urn:uuid:valid");
    expect(libraries[0].slug).toBe("uuid-valid");
  });
});

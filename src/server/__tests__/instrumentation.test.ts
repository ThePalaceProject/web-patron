/**
 * @jest-environment node
 */

jest.mock("node:http", () => ({
  Server: { prototype: { emit: jest.fn().mockReturnValue(true) } }
}));

jest.mock("server/appConfig", () => ({
  getAppConfig: jest.fn()
}));

jest.mock("server/libraryRegistry", () => ({
  getLibraries: jest.fn()
}));

import * as http from "node:http";
import { EventEmitter } from "node:events";
import { register } from "../../instrumentation";
import { getAppConfig } from "server/appConfig";
import { getLibraries } from "server/libraryRegistry";

type EmitFn = (event: string | symbol, ...args: unknown[]) => boolean;
const serverProto = http.Server.prototype as unknown as { emit: EmitFn };

const mockGetAppConfig = getAppConfig as jest.Mock;
const mockGetLibraries = getLibraries as jest.Mock;

const originalEnv = process.env;
let savedFetch: typeof globalThis.fetch;
let originalEmit: jest.MockedFunction<EmitFn>;

beforeAll(() => {
  // Capture originals before any register() call mutates them.
  savedFetch = globalThis.fetch;
  originalEmit = serverProto.emit as jest.MockedFunction<EmitFn>;
});

beforeEach(() => {
  process.env = { ...originalEnv };
  jest.clearAllMocks();
  // Reset to prevent chaining across tests.
  serverProto.emit = originalEmit;
  originalEmit.mockReturnValue(true);
  globalThis.fetch = savedFetch;
});

afterEach(() => {
  process.env = originalEnv;
});

describe("register", () => {
  it("does not call getAppConfig when NEXT_RUNTIME is 'edge'", async () => {
    process.env.NEXT_RUNTIME = "edge";
    await register();
    expect(mockGetAppConfig).not.toHaveBeenCalled();
  });

  it("does not call getAppConfig when NEXT_RUNTIME is unset", async () => {
    delete process.env.NEXT_RUNTIME;
    await register();
    expect(mockGetAppConfig).not.toHaveBeenCalled();
  });

  it("calls getAppConfig when NEXT_RUNTIME is 'nodejs'", async () => {
    process.env.NEXT_RUNTIME = "nodejs";
    mockGetAppConfig.mockResolvedValue({});
    mockGetLibraries.mockResolvedValue({});
    await register();
    expect(mockGetAppConfig).toHaveBeenCalledTimes(1);
  });

  it("resolves without error when getAppConfig succeeds", async () => {
    process.env.NEXT_RUNTIME = "nodejs";
    mockGetAppConfig.mockResolvedValue({});
    mockGetLibraries.mockResolvedValue({});
    await expect(register()).resolves.toBeUndefined();
  });

  it("calls getLibraries with the appConfig returned by getAppConfig", async () => {
    process.env.NEXT_RUNTIME = "nodejs";
    const fakeConfig = { registries: [], staticLibraries: {} };
    mockGetAppConfig.mockResolvedValue(fakeConfig);
    mockGetLibraries.mockResolvedValue({});
    await register();
    expect(mockGetLibraries).toHaveBeenCalledWith(fakeConfig);
  });

  it("does not call getLibraries when getAppConfig fails", async () => {
    process.env.NEXT_RUNTIME = "nodejs";
    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    mockGetAppConfig.mockRejectedValue(new Error("bad config"));
    await register();
    expect(mockGetLibraries).not.toHaveBeenCalled();
    exitSpy.mockRestore();
  });

  it("does not call getLibraries when NEXT_RUNTIME is not 'nodejs'", async () => {
    delete process.env.NEXT_RUNTIME;
    await register();
    expect(mockGetLibraries).not.toHaveBeenCalled();
  });

  it("does not patch http.Server.prototype.emit when NEXT_RUNTIME is not 'nodejs'", async () => {
    delete process.env.NEXT_RUNTIME;
    await register();
    expect(serverProto.emit).toBe(originalEmit);
  });

  it("does not replace globalThis.fetch when NEXT_RUNTIME is not 'nodejs'", async () => {
    delete process.env.NEXT_RUNTIME;
    await register();
    expect(globalThis.fetch).toBe(savedFetch);
  });

  describe("when getAppConfig throws", () => {
    let exitSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
      process.env.NEXT_RUNTIME = "nodejs";
      exitSpy = jest
        .spyOn(process, "exit")
        .mockImplementation(() => undefined as never);
      errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
    });

    afterEach(() => {
      exitSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it("calls process.exit(1)", async () => {
      mockGetAppConfig.mockRejectedValue(new Error("bad config"));
      await register();
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it("logs the error message when the thrown value is an Error", async () => {
      mockGetAppConfig.mockRejectedValue(new Error("config not found"));
      await register();
      expect(errorSpy).toHaveBeenCalledWith("config not found");
    });

    it("logs String(e) when the thrown value is not an Error", async () => {
      mockGetAppConfig.mockRejectedValue("plain string error");
      await register();
      expect(errorSpy).toHaveBeenCalledWith("plain string error");
    });
  });
});

// ---------------------------------------------------------------------------
// HTTP request logging
// ---------------------------------------------------------------------------

describe("HTTP request logging", () => {
  let logSpy: jest.SpyInstance;

  beforeEach(async () => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    process.env.NEXT_RUNTIME = "nodejs";
    mockGetAppConfig.mockResolvedValue({});
    mockGetLibraries.mockResolvedValue({});
    await register();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("patches http.Server.prototype.emit", () => {
    expect(serverProto.emit).not.toBe(originalEmit);
  });

  it("calls the original emit for every event", () => {
    const patchedEmit = serverProto.emit;
    patchedEmit.call({}, "some-event", "arg");
    expect(originalEmit).toHaveBeenCalledWith("some-event", "arg");
  });

  it("returns the original emit's return value", () => {
    originalEmit.mockReturnValue(false);
    const patchedEmit = serverProto.emit;
    expect(patchedEmit.call({}, "some-event")).toBe(false);
  });

  it("does not log before the response finishes", () => {
    const patchedEmit = serverProto.emit;
    const mockReq = { method: "GET", url: "/books" };
    const mockRes = new EventEmitter() as any;
    mockRes.statusCode = 200;

    patchedEmit.call({}, "request", mockReq, mockRes);

    expect(logSpy).not.toHaveBeenCalled();
  });

  it.each<[string, string, number, string]>([
    ["GET", "/books", 200, "recv GET /books 200"],
    ["POST", "/loans", 404, "recv POST /loans 404"]
  ])(
    "logs 'recv %s %s %d' on response finish",
    (method, url, statusCode, expected) => {
      const patchedEmit = serverProto.emit;
      const mockReq = { method, url };
      const mockRes = new EventEmitter() as any;
      mockRes.statusCode = statusCode;

      patchedEmit.call({}, "request", mockReq, mockRes);
      mockRes.emit("finish");

      expect(logSpy).toHaveBeenCalledWith(expected);
    }
  );

  it("does not attach a finish listener for non-'request' events", () => {
    const patchedEmit = serverProto.emit;
    const mockRes = new EventEmitter() as any;

    patchedEmit.call({}, "connection", {}, mockRes);

    expect(mockRes.listenerCount("finish")).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Outbound fetch logging
// ---------------------------------------------------------------------------

describe("outbound fetch logging", () => {
  let logSpy: jest.SpyInstance;
  let mockFetch: jest.Mock;

  beforeEach(async () => {
    mockFetch = jest.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    process.env.NEXT_RUNTIME = "nodejs";
    mockGetAppConfig.mockResolvedValue({});
    mockGetLibraries.mockResolvedValue({});
    await register();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("replaces globalThis.fetch with a logging wrapper", () => {
    expect(globalThis.fetch).not.toBe(mockFetch);
  });

  it("passes arguments through to the underlying fetch", async () => {
    mockFetch.mockResolvedValue({ status: 200 });
    await globalThis.fetch("https://example.com", { method: "POST" });
    expect(mockFetch).toHaveBeenCalledWith("https://example.com", {
      method: "POST"
    });
  });

  it("returns the response on success", async () => {
    const mockResponse = { status: 200 };
    mockFetch.mockResolvedValue(mockResponse);
    const result = await globalThis.fetch("https://example.com");
    expect(result).toBe(mockResponse as unknown as Response);
  });

  describe("on a successful response", () => {
    it("logs 'send METHOD URL STATUS Xms'", async () => {
      mockFetch.mockResolvedValue({ status: 200 });
      await globalThis.fetch("https://example.com/path");
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          /^send GET https:\/\/example\.com\/path 200 \d+ms$/
        )
      );
    });

    it("defaults to GET when no method is specified", async () => {
      mockFetch.mockResolvedValue({ status: 200 });
      await globalThis.fetch("https://example.com");
      expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/^send GET /));
    });

    it("uses and uppercases the method from init", async () => {
      mockFetch.mockResolvedValue({ status: 201 });
      await globalThis.fetch("https://example.com", { method: "post" });
      expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/^send POST /));
    });
  });

  describe("on a failed request", () => {
    it("logs 'send METHOD URL ERROR Xms'", async () => {
      mockFetch.mockRejectedValue(new Error("timeout"));
      await expect(globalThis.fetch("https://example.com")).rejects.toThrow();
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^send GET https:\/\/example\.com ERROR \d+ms$/)
      );
    });

    it("re-throws the original error", async () => {
      const error = new Error("network failure");
      mockFetch.mockRejectedValue(error);
      await expect(globalThis.fetch("https://example.com")).rejects.toBe(error);
    });
  });

  describe("URL and method extraction", () => {
    it.each<[string, string | URL | Request, string]>([
      [
        "string",
        "https://string-url.example.com/path",
        "https://string-url.example.com/path"
      ],
      [
        "URL object",
        new URL("https://url-object.example.com/path"),
        "https://url-object.example.com/path"
      ],
      [
        "Request object",
        new Request("https://request-url.example.com/path"),
        "https://request-url.example.com/path"
      ]
    ])("reads the URL from a %s input", async (_, input, expectedUrl) => {
      mockFetch.mockResolvedValue({ status: 200 });
      await globalThis.fetch(input);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(expectedUrl));
    });

    it("reads the method from a Request object when init.method is absent", async () => {
      mockFetch.mockResolvedValue({ status: 200 });
      const request = new Request("https://example.com", { method: "PUT" });
      await globalThis.fetch(request);
      expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/^send PUT /));
    });

    it("prefers init.method over a Request object's method", async () => {
      mockFetch.mockResolvedValue({ status: 200 });
      const request = new Request("https://example.com", { method: "PUT" });
      await globalThis.fetch(request, { method: "delete" });
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^send DELETE /)
      );
    });
  });
});

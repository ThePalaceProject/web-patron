/**
 * @jest-environment node
 */

jest.mock("server/appConfig", () => ({
  getAppConfig: jest.fn()
}));

import { register } from "../../instrumentation";
import { getAppConfig } from "server/appConfig";

const mockGetAppConfig = getAppConfig as jest.Mock;

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
  jest.clearAllMocks();
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
    await register();
    expect(mockGetAppConfig).toHaveBeenCalledTimes(1);
  });

  it("resolves without error when getAppConfig succeeds", async () => {
    process.env.NEXT_RUNTIME = "nodejs";
    mockGetAppConfig.mockResolvedValue({});
    await expect(register()).resolves.toBeUndefined();
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

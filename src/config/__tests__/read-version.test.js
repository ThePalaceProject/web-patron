/**
 * @jest-environment node
 */

const { readVersionInfo } = require("../read-version");

describe("readVersionInfo", () => {
  describe("APP_VERSION", () => {
    test("uses version from _version.json", () => {
      const { APP_VERSION } = readVersionInfo({ version: "1.2.3" });
      expect(APP_VERSION).toBe("1.2.3");
    });

    test("is null when version is absent", () => {
      const { APP_VERSION } = readVersionInfo({});
      expect(APP_VERSION).toBeNull();
    });
  });

  describe("GIT_COMMIT_SHA", () => {
    test("uses commit from _version.json without calling git", () => {
      const execSync = jest.fn();
      const { GIT_COMMIT_SHA } = readVersionInfo({ commit: "abc123" }, execSync);
      expect(GIT_COMMIT_SHA).toBe("abc123");
      expect(execSync).not.toHaveBeenCalledWith("git rev-parse HEAD");
    });

    test("falls back to git when commit is absent from _version.json", () => {
      const execSync = jest.fn(cmd => {
        if (cmd === "git rev-parse HEAD") return "deadbeef\n";
        return "main\n";
      });
      const { GIT_COMMIT_SHA } = readVersionInfo({}, execSync);
      expect(GIT_COMMIT_SHA).toBe("deadbeef");
    });

    test("is null when _version.json and git both fail", () => {
      const execSync = jest.fn(() => { throw new Error("git not found"); });
      const { GIT_COMMIT_SHA } = readVersionInfo({}, execSync);
      expect(GIT_COMMIT_SHA).toBeNull();
    });
  });

  describe("GIT_BRANCH", () => {
    test("uses branch from _version.json without calling git", () => {
      const execSync = jest.fn();
      const { GIT_BRANCH } = readVersionInfo({ branch: "my-feature" }, execSync);
      expect(GIT_BRANCH).toBe("my-feature");
      expect(execSync).not.toHaveBeenCalledWith("git rev-parse --abbrev-ref HEAD");
    });

    test("falls back to git when branch is absent from _version.json", () => {
      const execSync = jest.fn(cmd => {
        if (cmd === "git rev-parse --abbrev-ref HEAD") return "main\n";
        return "deadbeef\n";
      });
      const { GIT_BRANCH } = readVersionInfo({}, execSync);
      expect(GIT_BRANCH).toBe("main");
    });

    test("is null when _version.json and git both fail", () => {
      const execSync = jest.fn(() => { throw new Error("git not found"); });
      const { GIT_BRANCH } = readVersionInfo({}, execSync);
      expect(GIT_BRANCH).toBeNull();
    });
  });

  test("uses all fields from _version.json, making no git calls", () => {
    const execSync = jest.fn();
    const result = readVersionInfo(
      { version: "2.0.0", commit: "cafebabe", branch: "production" },
      execSync
    );
    expect(result).toEqual({
      APP_VERSION: "2.0.0",
      GIT_COMMIT_SHA: "cafebabe",
      GIT_BRANCH: "production"
    });
    expect(execSync).not.toHaveBeenCalled();
  });

  test("uses defaults when called with no arguments", () => {
    // Smoke test: readVersionInfo() must not throw even with an empty versionJson.
    // Actual git output depends on the environment, so we only assert types.
    const result = readVersionInfo({});
    expect(result).toHaveProperty("APP_VERSION");
    expect(result).toHaveProperty("GIT_COMMIT_SHA");
    expect(result).toHaveProperty("GIT_BRANCH");
  });
});

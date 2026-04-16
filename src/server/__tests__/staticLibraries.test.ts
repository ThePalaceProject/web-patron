/**
 * @jest-environment node
 *
 * Tests for the runtime static library loader.
 * Run under jest.config.node.js.
 */

import {
  getStaticLibraries,
  resetStaticLibrariesCache
} from "../staticLibraries";

jest.mock("fs", () => ({
  readFileSync: jest.fn()
}));

import { readFileSync } from "fs";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeYaml(libraries: string): string {
  return `instance_name: Test\n${libraries}\nmedia_support: {}`;
}

function mockConfigFile(content: string): void {
  process.env.CONFIG_FILE = "/test/config.yml";
  (readFileSync as jest.Mock).mockReturnValue(content);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getStaticLibraries", () => {
  beforeEach(() => {
    resetStaticLibrariesCache();
    delete process.env.CONFIG_FILE;
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.CONFIG_FILE;
  });

  it("returns empty object when CONFIG_FILE is not set", async () => {
    const result = await getStaticLibraries();
    expect(result).toEqual({});
  });

  it("returns empty object when config has no libraries section", async () => {
    mockConfigFile(`instance_name: Test\nmedia_support: {}`);
    const result = await getStaticLibraries();
    expect(result).toEqual({});
  });

  it("returns empty object when libraries is a string (deprecated registry URL)", async () => {
    mockConfigFile(
      makeYaml("libraries: https://registry.example.com/libraries")
    );
    const result = await getStaticLibraries();
    expect(result).toEqual({});
  });

  it("returns empty object when libraries is empty object", async () => {
    mockConfigFile(makeYaml("libraries: {}"));
    const result = await getStaticLibraries();
    expect(result).toEqual({});
  });

  it("parses string-format entry (auth doc URL, slug as title)", async () => {
    mockConfigFile(makeYaml("libraries:\n  my-lib: https://example.com/auth"));
    const result = await getStaticLibraries();
    expect(result).toEqual({
      "my-lib": { title: "my-lib", authDocUrl: "https://example.com/auth" }
    });
  });

  it("parses object-format entry with authDocUrl and title", async () => {
    mockConfigFile(
      makeYaml(
        "libraries:\n  my-lib:\n    authDocUrl: https://example.com/auth\n    title: My Library"
      )
    );
    const result = await getStaticLibraries();
    expect(result).toEqual({
      "my-lib": { title: "My Library", authDocUrl: "https://example.com/auth" }
    });
  });

  it("uses slug as title when title is absent from object-format entry", async () => {
    mockConfigFile(
      makeYaml(
        "libraries:\n  my-lib:\n    authDocUrl: https://example.com/auth"
      )
    );
    const result = await getStaticLibraries();
    expect(result["my-lib"]?.title).toBe("my-lib");
  });

  it("parses multiple entries", async () => {
    mockConfigFile(
      makeYaml(
        "libraries:\n  lib-a: https://a.example.com/auth\n  lib-b: https://b.example.com/auth"
      )
    );
    const result = await getStaticLibraries();
    expect(Object.keys(result)).toHaveLength(2);
    expect(result["lib-a"]?.authDocUrl).toBe("https://a.example.com/auth");
    expect(result["lib-b"]?.authDocUrl).toBe("https://b.example.com/auth");
  });

  it("caches the result on subsequent calls", async () => {
    mockConfigFile(makeYaml("libraries:\n  my-lib: https://example.com/auth"));
    await getStaticLibraries();
    await getStaticLibraries();
    expect(readFileSync).toHaveBeenCalledTimes(1);
  });

  it("re-reads after resetStaticLibrariesCache", async () => {
    mockConfigFile(makeYaml("libraries:\n  my-lib: https://example.com/auth"));
    await getStaticLibraries();
    resetStaticLibrariesCache();
    await getStaticLibraries();
    expect(readFileSync).toHaveBeenCalledTimes(2);
  });

  describe("validation errors", () => {
    it("throws for null value", async () => {
      mockConfigFile(makeYaml("libraries:\n  bad-lib: null"));
      await expect(getStaticLibraries()).rejects.toThrow(
        "CONFIG_FILE.libraries['bad-lib'] cannot be null or undefined"
      );
    });

    it("throws for empty string value", async () => {
      mockConfigFile(makeYaml('libraries:\n  bad-lib: ""'));
      await expect(getStaticLibraries()).rejects.toThrow(
        "CONFIG_FILE.libraries['bad-lib'] cannot be an empty string"
      );
    });

    it("throws for whitespace-only string value", async () => {
      mockConfigFile(makeYaml('libraries:\n  bad-lib: "   "'));
      await expect(getStaticLibraries()).rejects.toThrow(
        "CONFIG_FILE.libraries['bad-lib'] cannot be an empty string"
      );
    });

    it("throws for object missing authDocUrl", async () => {
      mockConfigFile(makeYaml("libraries:\n  bad-lib:\n    title: My Library"));
      await expect(getStaticLibraries()).rejects.toThrow(
        "CONFIG_FILE.libraries['bad-lib'] must have an 'authDocUrl' property with a valid URL string"
      );
    });

    it("throws for object with non-string authDocUrl", async () => {
      mockConfigFile(makeYaml("libraries:\n  bad-lib:\n    authDocUrl: 12345"));
      await expect(getStaticLibraries()).rejects.toThrow(
        "CONFIG_FILE.libraries['bad-lib'] must have an 'authDocUrl' property with a valid URL string"
      );
    });

    it("throws for object with empty authDocUrl", async () => {
      mockConfigFile(makeYaml('libraries:\n  bad-lib:\n    authDocUrl: ""'));
      await expect(getStaticLibraries()).rejects.toThrow(
        "CONFIG_FILE.libraries['bad-lib'].authDocUrl cannot be an empty string"
      );
    });

    it("throws for object with non-string title", async () => {
      mockConfigFile(
        makeYaml(
          "libraries:\n  bad-lib:\n    authDocUrl: https://example.com/auth\n    title: 123"
        )
      );
      await expect(getStaticLibraries()).rejects.toThrow(
        "CONFIG_FILE.libraries['bad-lib'].title must be a string"
      );
    });

    it("throws for object with empty title", async () => {
      mockConfigFile(
        makeYaml(
          'libraries:\n  bad-lib:\n    authDocUrl: https://example.com/auth\n    title: ""'
        )
      );
      await expect(getStaticLibraries()).rejects.toThrow(
        "CONFIG_FILE.libraries['bad-lib'].title cannot be an empty string"
      );
    });

    it("throws for number value", async () => {
      mockConfigFile(makeYaml("libraries:\n  bad-lib: 12345"));
      await expect(getStaticLibraries()).rejects.toThrow(
        "CONFIG_FILE.libraries['bad-lib'] must be either a string (auth doc URL) or an object with 'authDocUrl' property"
      );
    });

    it("throws for boolean value", async () => {
      mockConfigFile(makeYaml("libraries:\n  bad-lib: true"));
      await expect(getStaticLibraries()).rejects.toThrow(
        "CONFIG_FILE.libraries['bad-lib'] must be either a string (auth doc URL) or an object with 'authDocUrl' property"
      );
    });
  });
});

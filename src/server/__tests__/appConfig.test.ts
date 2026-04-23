/**
 * @jest-environment node
 *
 * Unit tests for src/server/appConfig.ts.
 */

import path from "path";
import type { AppConfig } from "interfaces";
import { getAppConfig, resetAppConfigCache } from "../appConfig";
import { AppSetupError } from "errors";
import { DEFAULT_REGISTRY_FETCH_TIMEOUT } from "constants/registry";

jest.mock("fs", () => ({ readFileSync: jest.fn() }));

import { readFileSync } from "fs";

const mockReadFileSync = readFileSync as jest.Mock;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MINIMAL_YAML = `instance_name: Test Library`;

function mockFile(yaml: string): void {
  mockReadFileSync.mockReturnValue(yaml);
}

function mockFetchText(text: string, ok = true, status = 200): jest.Mock {
  return jest.fn().mockResolvedValue({
    ok,
    status,
    text: async () => text
  });
}

// ---------------------------------------------------------------------------
// Global setup — runs before every test in this file.
// ---------------------------------------------------------------------------

const originalEnv = process.env;

beforeEach(() => {
  resetAppConfigCache();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

// ---------------------------------------------------------------------------
// getAppConfig — environment and I/O behaviour
// ---------------------------------------------------------------------------

describe("getAppConfig", () => {
  it("throws AppSetupError when CONFIG_FILE is not set", async () => {
    delete process.env.CONFIG_FILE;
    await expect(getAppConfig()).rejects.toThrow(AppSetupError);
  });

  it("error message mentions CONFIG_FILE when env var is missing", async () => {
    delete process.env.CONFIG_FILE;
    await expect(getAppConfig()).rejects.toThrow("CONFIG_FILE");
  });

  // --- Local file ---

  it("reads an absolute file path directly", async () => {
    process.env.CONFIG_FILE = "/etc/app/config.yml";
    mockFile(MINIMAL_YAML);

    await getAppConfig();
    expect(mockReadFileSync).toHaveBeenCalledWith(
      "/etc/app/config.yml",
      "utf8"
    );
  });

  it("resolves a relative path against process.cwd()", async () => {
    process.env.CONFIG_FILE = "config/app.yml";
    mockFile(MINIMAL_YAML);

    await getAppConfig();
    expect(mockReadFileSync).toHaveBeenCalledWith(
      path.join(process.cwd(), "config/app.yml"),
      "utf8"
    );
  });

  it("returns a parsed config from a local file", async () => {
    process.env.CONFIG_FILE = "/etc/app/config.yml";
    mockFile(`instance_name: My Catalog`);

    const config = await getAppConfig();
    expect(config.instanceName).toBe("My Catalog");
  });

  // --- YAML structure ---

  it.each([
    ["null", "~"],
    ["a bare scalar", "just a string"],
    ["a sequence", "- item1\n- item2"]
  ])(
    "throws AppSetupError when the config file is %s rather than a mapping",
    async (_label, yaml) => {
      process.env.CONFIG_FILE = "/etc/app/config.yml";
      mockFile(yaml);
      await expect(getAppConfig()).rejects.toThrow(AppSetupError);
    }
  );

  // --- HTTP URL ---

  it("fetches config from an http URL", async () => {
    process.env.CONFIG_FILE = "http://example.com/config.yml";
    global.fetch = mockFetchText(MINIMAL_YAML) as unknown as typeof fetch;

    await getAppConfig();
    expect(global.fetch).toHaveBeenCalledWith(
      "http://example.com/config.yml",
      expect.any(Object)
    );
  });

  it("fetches config from an https URL", async () => {
    process.env.CONFIG_FILE = "https://example.com/config.yml";
    global.fetch = mockFetchText(MINIMAL_YAML) as unknown as typeof fetch;

    const config = await getAppConfig();
    expect(config.instanceName).toBe("Test Library");
  });

  it("passes an AbortSignal to fetch", async () => {
    process.env.CONFIG_FILE = "https://example.com/config.yml";
    let capturedSignal: AbortSignal | undefined;
    global.fetch = jest
      .fn()
      .mockImplementation((_url: string, init: RequestInit) => {
        capturedSignal = init?.signal as AbortSignal;
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () => MINIMAL_YAML
        });
      }) as unknown as typeof fetch;

    await getAppConfig();
    expect(capturedSignal).toBeInstanceOf(AbortSignal);
  });

  it("throws AppSetupError when the HTTP response is not ok", async () => {
    process.env.CONFIG_FILE = "https://example.com/config.yml";
    global.fetch = mockFetchText("", false, 503) as unknown as typeof fetch;

    await expect(getAppConfig()).rejects.toThrow(AppSetupError);
  });

  it("includes a non-Error rejection value in the error message", async () => {
    process.env.CONFIG_FILE = "https://example.com/config.yml";
    global.fetch = jest
      .fn()
      .mockRejectedValue("network failure") as unknown as typeof fetch;

    await expect(getAppConfig()).rejects.toThrow("network failure");
  });

  // --- Fetch timeout ---

  describe("fetch timeout", () => {
    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it("aborts a hung fetch after DEFAULT_REGISTRY_FETCH_TIMEOUT seconds", async () => {
      jest.useFakeTimers();
      process.env.CONFIG_FILE = "https://example.com/config.yml";
      let capturedSignal: AbortSignal | undefined;
      global.fetch = jest
        .fn()
        .mockImplementation((_url: string, init: RequestInit) => {
          capturedSignal = init?.signal as AbortSignal;
          return new Promise<never>((_resolve, reject) => {
            capturedSignal?.addEventListener("abort", () =>
              reject(new DOMException("aborted", "AbortError"))
            );
          });
        }) as unknown as typeof fetch;

      const configPromise = getAppConfig();
      const assertion = expect(configPromise).rejects.toThrow();
      await (jest as any).advanceTimersByTimeAsync(
        DEFAULT_REGISTRY_FETCH_TIMEOUT * 1000 + 1
      );
      await assertion;

      expect(capturedSignal?.aborted).toBe(true);
    });

    it("clears the fetch timeout after a successful response", async () => {
      jest.useFakeTimers();
      process.env.CONFIG_FILE = "https://example.com/config.yml";
      global.fetch = mockFetchText(MINIMAL_YAML) as unknown as typeof fetch;

      await getAppConfig();
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  // --- Caching ---

  it("returns the same object reference on repeated calls", async () => {
    process.env.CONFIG_FILE = "/etc/app/config.yml";
    mockFile(MINIMAL_YAML);

    const first = await getAppConfig();
    const second = await getAppConfig();

    expect(first).toBe(second);
    expect(mockReadFileSync).toHaveBeenCalledTimes(1);
  });

  it("re-reads the file after resetAppConfigCache()", async () => {
    process.env.CONFIG_FILE = "/etc/app/config.yml";
    mockFile(`instance_name: First`);
    await getAppConfig();

    resetAppConfigCache();
    mockFile(`instance_name: Second`);

    const config = await getAppConfig();
    expect(config.instanceName).toBe("Second");
  });
});

// ---------------------------------------------------------------------------
// Config parsing — tested via getAppConfig with a local file mock.
// ---------------------------------------------------------------------------

describe("config parsing", () => {
  beforeEach(() => {
    process.env.CONFIG_FILE = "/test/config.yml";
  });

  async function load(yaml: string): Promise<AppConfig> {
    mockFile(yaml);
    return getAppConfig();
  }

  // --- instanceName ---

  describe("instanceName", () => {
    it("uses instance_name when it is a string", async () => {
      expect((await load(`instance_name: My Library`)).instanceName).toBe(
        "My Library"
      );
    });

    it("defaults to 'Patron Web Catalog' when instance_name is absent", async () => {
      expect((await load(`other: value`)).instanceName).toBe(
        "Patron Web Catalog"
      );
    });

    it("defaults to 'Patron Web Catalog' when instance_name is not a string", async () => {
      expect((await load(`instance_name: 42`)).instanceName).toBe(
        "Patron Web Catalog"
      );
    });
  });

  // --- companionApp ---

  describe("companionApp", () => {
    it("is 'openebooks' when companion_app is 'openebooks'", async () => {
      expect((await load(`companion_app: openebooks`)).companionApp).toBe(
        "openebooks"
      );
    });

    it("defaults to 'simplye' when companion_app is absent", async () => {
      expect((await load(MINIMAL_YAML)).companionApp).toBe("simplye");
    });

    it("is 'simplye' for unrecognized companion_app values", async () => {
      expect((await load(`companion_app: other`)).companionApp).toBe("simplye");
    });
  });

  // --- showMedium ---

  describe("showMedium", () => {
    it("defaults to true when show_medium is absent", async () => {
      expect((await load(MINIMAL_YAML)).showMedium).toBe(true);
    });

    it("is false when show_medium is false", async () => {
      expect((await load(`show_medium: false`)).showMedium).toBe(false);
    });

    it("is true when show_medium is true", async () => {
      expect((await load(`show_medium: true`)).showMedium).toBe(true);
    });
  });

  // --- openebooks ---

  describe("openebooks", () => {
    it("is null when openebooks section is absent", async () => {
      expect((await load(MINIMAL_YAML)).openebooks).toBeNull();
    });

    it("parses openebooks.default_library into defaultLibrary", async () => {
      const yaml = "openebooks:\n  default_library: nyc-lib";
      expect((await load(yaml)).openebooks).toEqual({
        defaultLibrary: "nyc-lib"
      });
    });
  });

  // --- bugsnagApiKey ---

  describe("bugsnagApiKey", () => {
    it("is null when absent", async () => {
      expect((await load(MINIMAL_YAML)).bugsnagApiKey).toBeNull();
    });

    it("uses the string value of bugsnag_api_key", async () => {
      expect((await load(`bugsnag_api_key: abc123`)).bugsnagApiKey).toBe(
        "abc123"
      );
    });
  });

  // --- gtmId ---

  describe("gtmId", () => {
    it("is null when absent", async () => {
      expect((await load(MINIMAL_YAML)).gtmId).toBeNull();
    });

    it("uses the string value of gtmId", async () => {
      expect((await load(`gtmId: GTM-XXXX`)).gtmId).toBe("GTM-XXXX");
    });
  });

  // --- registries ---

  describe("registries", () => {
    it("defaults to an empty array when registries is absent", async () => {
      expect((await load(MINIMAL_YAML)).registries).toEqual([]);
    });

    it("parses a single registry with default intervals", async () => {
      const yaml = "registries:\n  - url: https://reg.example.com/";
      expect((await load(yaml)).registries).toEqual([
        {
          url: "https://reg.example.com/",
          refreshMinInterval: 60,
          refreshMaxInterval: 300
        }
      ]);
    });

    it("parses multiple registries", async () => {
      const yaml = [
        "registries:",
        "  - url: https://reg1.example.com/",
        "  - url: https://reg2.example.com/"
      ].join("\n");
      expect((await load(yaml)).registries).toHaveLength(2);
    });

    it("uses custom refreshMinInterval and refreshMaxInterval when provided", async () => {
      const yaml = [
        "registries:",
        "  - url: https://reg.example.com/",
        "    refreshMinInterval: 30",
        "    refreshMaxInterval: 600"
      ].join("\n");
      expect((await load(yaml)).registries).toMatchObject([
        { refreshMinInterval: 30, refreshMaxInterval: 600 }
      ]);
    });

    it("throws AppSetupError when registries is not an array", async () => {
      await expect(load(`registries: not-an-array`)).rejects.toThrow(
        AppSetupError
      );
    });

    it("throws AppSetupError when a registry entry is not an object", async () => {
      await expect(load("registries:\n  - just-a-string")).rejects.toThrow(
        AppSetupError
      );
    });

    it("throws AppSetupError when a registry entry is missing url", async () => {
      await expect(load("registries:\n  - name: missing-url")).rejects.toThrow(
        AppSetupError
      );
    });

    it("throws AppSetupError when a registry entry url is not a string", async () => {
      await expect(load("registries:\n  - url: 42")).rejects.toThrow(
        AppSetupError
      );
    });
  });

  // --- deprecated string libraries field ---

  describe("deprecated libraries field", () => {
    it("adds a string libraries value as a registry entry", async () => {
      const config = await load(`libraries: https://old.example.com/libs`);
      expect(config.registries).toEqual([
        {
          url: "https://old.example.com/libs",
          refreshMinInterval: 60,
          refreshMaxInterval: 300
        }
      ]);
    });

    it("emits a deprecation warning when string libraries is used", async () => {
      const warnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await load(`libraries: https://old.example.com/libs`);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("deprecated")
      );
      warnSpy.mockRestore();
    });

    it("appends the string libraries entry after explicit registries", async () => {
      const yaml = [
        "registries:",
        "  - url: https://reg.example.com/",
        "libraries: https://old.example.com/libs"
      ].join("\n");
      const config = await load(yaml);
      expect(config.registries).toHaveLength(2);
      expect(config.registries?.[0]?.url).toBe("https://reg.example.com/");
      expect(config.registries?.[1]?.url).toBe("https://old.example.com/libs");
    });
  });

  // --- mediaSupport ---

  describe("mediaSupport", () => {
    it("defaults to an empty object when media_support is absent", async () => {
      expect((await load(MINIMAL_YAML)).mediaSupport).toEqual({});
    });

    it("passes through media_support values", async () => {
      const yaml = "media_support:\n  application/epub+zip: show";
      expect((await load(yaml)).mediaSupport).toEqual({
        "application/epub+zip": "show"
      });
    });

    it.each(["show", "redirect", "redirect-and-show", "unsupported"])(
      "accepts the valid value '%s'",
      async level => {
        const yaml = `media_support:\n  application/epub+zip: ${level}`;
        await expect(load(yaml)).resolves.not.toThrow();
      }
    );

    it("throws AppSetupError for an unrecognized value", async () => {
      await expect(
        load(`media_support:\n  application/epub+zip: invalid-mode`)
      ).rejects.toThrow(AppSetupError);
    });

    it("error message names the MIME type and the bad value", async () => {
      await expect(
        load(`media_support:\n  application/epub+zip: invalid-mode`)
      ).rejects.toThrow(
        `CONFIG_FILE.media_support['application/epub+zip'] has unrecognized value "invalid-mode"`
      );
    });

    it("error message lists all valid values", async () => {
      await expect(
        load(`media_support:\n  application/epub+zip: invalid-mode`)
      ).rejects.toThrow("show, redirect, redirect-and-show, unsupported");
    });
  });

  // --- libraries ---

  describe("libraries", () => {
    it.each([
      ["absent", MINIMAL_YAML],
      [
        "a string (deprecated registry URL)",
        "libraries: https://registry.example.com/libraries"
      ]
    ])("is undefined when libraries is %s", async (_label, yaml) => {
      expect((await load(yaml)).staticLibraries).toBeUndefined();
    });

    it("is an empty object when libraries is an empty object", async () => {
      expect((await load("libraries: {}")).staticLibraries).toEqual({});
    });

    it("parses a string-format entry (auth doc URL, slug as title)", async () => {
      expect(
        (await load(`libraries:\n  my-lib: https://example.com/auth`))
          .staticLibraries
      ).toEqual({
        "my-lib": { title: "my-lib", authDocUrl: "https://example.com/auth" }
      });
    });

    it("parses an object-format entry with authDocUrl and title", async () => {
      const yaml =
        "libraries:\n  my-lib:\n    authDocUrl: https://example.com/auth\n    title: My Library";
      expect((await load(yaml)).staticLibraries).toEqual({
        "my-lib": {
          title: "My Library",
          authDocUrl: "https://example.com/auth"
        }
      });
    });

    it("uses slug as title when title is absent from object-format entry", async () => {
      const yaml =
        "libraries:\n  my-lib:\n    authDocUrl: https://example.com/auth";
      expect((await load(yaml)).staticLibraries?.["my-lib"]?.title).toBe(
        "my-lib"
      );
    });

    it("parses multiple entries", async () => {
      const yaml =
        "libraries:\n  lib-a: https://a.example.com/auth\n  lib-b: https://b.example.com/auth";
      const { staticLibraries } = await load(yaml);
      expect(Object.keys(staticLibraries!)).toHaveLength(2);
      expect(staticLibraries?.["lib-a"]?.authDocUrl).toBe(
        "https://a.example.com/auth"
      );
      expect(staticLibraries?.["lib-b"]?.authDocUrl).toBe(
        "https://b.example.com/auth"
      );
    });

    it.each([
      [
        "null entry",
        "libraries:\n  bad-lib: null",
        "CONFIG_FILE.libraries['bad-lib'] cannot be null or undefined"
      ],
      [
        "empty string entry",
        `libraries:\n  bad-lib: ""`,
        "CONFIG_FILE.libraries['bad-lib'] cannot be an empty string"
      ],
      [
        "whitespace-only string entry",
        `libraries:\n  bad-lib: "   "`,
        "CONFIG_FILE.libraries['bad-lib'] cannot be an empty string"
      ],
      [
        "object missing authDocUrl",
        "libraries:\n  bad-lib:\n    title: My Library",
        "CONFIG_FILE.libraries['bad-lib'] must have an 'authDocUrl' property with a valid URL string"
      ],
      [
        "object with non-string authDocUrl",
        "libraries:\n  bad-lib:\n    authDocUrl: 12345",
        "CONFIG_FILE.libraries['bad-lib'] must have an 'authDocUrl' property with a valid URL string"
      ],
      [
        "object with empty authDocUrl",
        `libraries:\n  bad-lib:\n    authDocUrl: ""`,
        "CONFIG_FILE.libraries['bad-lib'].authDocUrl cannot be an empty string"
      ],
      [
        "object with non-string title",
        "libraries:\n  bad-lib:\n    authDocUrl: https://example.com/auth\n    title: 123",
        "CONFIG_FILE.libraries['bad-lib'].title must be a string"
      ],
      [
        "object with empty title",
        `libraries:\n  bad-lib:\n    authDocUrl: https://example.com/auth\n    title: ""`,
        "CONFIG_FILE.libraries['bad-lib'].title cannot be an empty string"
      ],
      [
        "numeric entry",
        "libraries:\n  bad-lib: 12345",
        "CONFIG_FILE.libraries['bad-lib'] must be either a string (auth doc URL) or an object with 'authDocUrl' property"
      ],
      [
        "boolean entry",
        "libraries:\n  bad-lib: true",
        "CONFIG_FILE.libraries['bad-lib'] must be either a string (auth doc URL) or an object with 'authDocUrl' property"
      ]
    ])("throws AppSetupError for %s", async (_label, yaml, expectedMessage) => {
      await expect(load(yaml)).rejects.toThrow(expectedMessage);
    });

    it("emits a deprecation warning when an object is used", async () => {
      const warnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await load("libraries:\n  my-lib: https://example.com/auth");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("deprecated")
      );
      warnSpy.mockRestore();
    });

    it("throws AppSetupError when both libraries object and staticLibraries are set", async () => {
      const yaml = [
        "libraries:",
        "  my-lib: https://example.com/auth",
        "staticLibraries:",
        "  other-lib: https://other.example.com/auth"
      ].join("\n");
      await expect(load(yaml)).rejects.toThrow(
        "'staticLibraries' and the object form of 'libraries' cannot both be set"
      );
    });
  });

  // --- staticLibraries ---

  describe("staticLibraries", () => {
    it("is undefined when staticLibraries is absent", async () => {
      expect((await load(MINIMAL_YAML)).staticLibraries).toBeUndefined();
    });

    it("is an empty object when staticLibraries is an empty object", async () => {
      expect((await load("staticLibraries: {}")).staticLibraries).toEqual({});
    });

    it("parses a string-format entry (auth doc URL, slug as title)", async () => {
      expect(
        (await load("staticLibraries:\n  my-lib: https://example.com/auth"))
          .staticLibraries
      ).toEqual({
        "my-lib": { title: "my-lib", authDocUrl: "https://example.com/auth" }
      });
    });

    it("parses an object-format entry with authDocUrl and title", async () => {
      const yaml =
        "staticLibraries:\n  my-lib:\n    authDocUrl: https://example.com/auth\n    title: My Library";
      expect((await load(yaml)).staticLibraries).toEqual({
        "my-lib": {
          title: "My Library",
          authDocUrl: "https://example.com/auth"
        }
      });
    });

    it("uses slug as title when title is absent from object-format entry", async () => {
      const yaml =
        "staticLibraries:\n  my-lib:\n    authDocUrl: https://example.com/auth";
      expect((await load(yaml)).staticLibraries?.["my-lib"]?.title).toBe(
        "my-lib"
      );
    });

    it("parses multiple entries", async () => {
      const yaml =
        "staticLibraries:\n  lib-a: https://a.example.com/auth\n  lib-b: https://b.example.com/auth";
      const { staticLibraries } = await load(yaml);
      expect(Object.keys(staticLibraries!)).toHaveLength(2);
      expect(staticLibraries?.["lib-a"]?.authDocUrl).toBe(
        "https://a.example.com/auth"
      );
      expect(staticLibraries?.["lib-b"]?.authDocUrl).toBe(
        "https://b.example.com/auth"
      );
    });

    it("does not emit a deprecation warning", async () => {
      const warnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await load("staticLibraries:\n  my-lib: https://example.com/auth");
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it.each([
      [
        "null entry",
        "staticLibraries:\n  bad-lib: null",
        "CONFIG_FILE.staticLibraries['bad-lib'] cannot be null or undefined"
      ],
      [
        "empty string entry",
        `staticLibraries:\n  bad-lib: ""`,
        "CONFIG_FILE.staticLibraries['bad-lib'] cannot be an empty string"
      ],
      [
        "whitespace-only string entry",
        `staticLibraries:\n  bad-lib: "   "`,
        "CONFIG_FILE.staticLibraries['bad-lib'] cannot be an empty string"
      ],
      [
        "object missing authDocUrl",
        "staticLibraries:\n  bad-lib:\n    title: My Library",
        "CONFIG_FILE.staticLibraries['bad-lib'] must have an 'authDocUrl' property with a valid URL string"
      ],
      [
        "object with non-string authDocUrl",
        "staticLibraries:\n  bad-lib:\n    authDocUrl: 12345",
        "CONFIG_FILE.staticLibraries['bad-lib'] must have an 'authDocUrl' property with a valid URL string"
      ],
      [
        "object with empty authDocUrl",
        `staticLibraries:\n  bad-lib:\n    authDocUrl: ""`,
        "CONFIG_FILE.staticLibraries['bad-lib'].authDocUrl cannot be an empty string"
      ],
      [
        "object with non-string title",
        "staticLibraries:\n  bad-lib:\n    authDocUrl: https://example.com/auth\n    title: 123",
        "CONFIG_FILE.staticLibraries['bad-lib'].title must be a string"
      ],
      [
        "object with empty title",
        `staticLibraries:\n  bad-lib:\n    authDocUrl: https://example.com/auth\n    title: ""`,
        "CONFIG_FILE.staticLibraries['bad-lib'].title cannot be an empty string"
      ],
      [
        "numeric entry",
        "staticLibraries:\n  bad-lib: 12345",
        "CONFIG_FILE.staticLibraries['bad-lib'] must be either a string (auth doc URL) or an object with 'authDocUrl' property"
      ],
      [
        "boolean entry",
        "staticLibraries:\n  bad-lib: true",
        "CONFIG_FILE.staticLibraries['bad-lib'] must be either a string (auth doc URL) or an object with 'authDocUrl' property"
      ]
    ])("throws AppSetupError for %s", async (_label, yaml, expectedMessage) => {
      await expect(load(yaml)).rejects.toThrow(expectedMessage);
    });
  });
});

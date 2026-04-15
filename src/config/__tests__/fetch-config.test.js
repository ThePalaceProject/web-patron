/**
 * @jest-environment node
 *
 * Tests for the config parsing logic in fetch-config.js
 * This runs in a Node environment (not jsdom) since fetch-config is a build-time script
 */

describe("fetch-config", () => {
  let parseConfig;
  let fetch;

  beforeEach(() => {
    jest.resetModules();

    fetch = jest.fn();
    jest.doMock("node-fetch", () => fetch);

    const configModule = require("../fetch-config");
    parseConfig = configModule.__parseConfigForTest;

    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("static libraries config (object format)", () => {
    // Static library entries are validated and resolved at runtime by
    // src/server/staticLibraries.ts. fetch-config always outputs libraries: {}.

    test("outputs empty libraries regardless of object-format libraries in config", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries:
  main-street: https://example.com/main-street/auth
  lyr-reads: https://example.com/lyr-reads/auth
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.registries).toEqual([]);
    });

    test("handles empty libraries object", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: {}
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.registries).toEqual([]);
    });
  });

  describe("registries array config (new format)", () => {
    test("parses registries array with all fields", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: {}
registries:
  - url: https://registry.example.com/libraries
    refreshMinInterval: 120
    refreshMaxInterval: 600
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.registries).toEqual([
        {
          url: "https://registry.example.com/libraries",
          refreshMinInterval: 120,
          refreshMaxInterval: 600
        }
      ]);
      expect(fetch).not.toHaveBeenCalled();
    });

    test("applies default intervals when not specified", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: {}
registries:
  - url: https://registry.example.com/libraries
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.registries).toEqual([
        {
          url: "https://registry.example.com/libraries",
          refreshMinInterval: 60,
          refreshMaxInterval: 300
        }
      ]);
      expect(fetch).not.toHaveBeenCalled();
    });

    test("parses multiple registries", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: {}
registries:
  - url: https://registry1.example.com/libraries
    refreshMinInterval: 60
    refreshMaxInterval: 300
  - url: https://registry2.example.com/libraries
    refreshMinInterval: 120
    refreshMaxInterval: 600
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.registries).toHaveLength(2);
      expect(config.registries[0].url).toBe(
        "https://registry1.example.com/libraries"
      );
      expect(config.registries[1].url).toBe(
        "https://registry2.example.com/libraries"
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    test("throws error if registries is not an array", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: {}
registries: "not an array"
media_support: {}
      `;

      await expect(parseConfig(yamlConfig)).rejects.toThrow(
        "CONFIG_FILE.registries must be an array"
      );
    });

    test("throws error if registry is missing url", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: {}
registries:
  - refresh_min_interval: 60
media_support: {}
      `;

      await expect(parseConfig(yamlConfig)).rejects.toThrow(
        "CONFIG_FILE.registries[0] must have a valid url string"
      );
    });

    test("throws error if registry url is not a string", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: {}
registries:
  - url: 123
media_support: {}
      `;

      await expect(parseConfig(yamlConfig)).rejects.toThrow(
        "CONFIG_FILE.registries[0] must have a valid url string"
      );
    });

    test("throws error if registry item is not an object", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: {}
registries:
  - https://registry.example.com/libraries
media_support: {}
      `;

      await expect(parseConfig(yamlConfig)).rejects.toThrow(
        "CONFIG_FILE.registries[0] must be an object with a url property"
      );
    });
  });

  describe("hybrid config (static libraries + registries)", () => {
    test("registries are stored in config; no build-time fetch occurs", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: {}
registries:
  - url: https://registry.example.com/libraries
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.registries).toEqual([
        {
          url: "https://registry.example.com/libraries",
          refreshMinInterval: 60,
          refreshMaxInterval: 300
        }
      ]);
      expect(fetch).not.toHaveBeenCalled();
    });

    test("static library entries do not appear in build output; registry config is stored", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries:
  shared-slug:
    authDocUrl: https://example.com/static-override/auth
    title: "Static Override Library"
registries:
  - url: https://registry.example.com/libraries
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.registries).toEqual([
        {
          url: "https://registry.example.com/libraries",
          refreshMinInterval: 60,
          refreshMaxInterval: 300
        }
      ]);
      expect(fetch).not.toHaveBeenCalled();
    });

    test("multiple registries are all stored in config", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: {}
registries:
  - url: https://registry1.example.com/libraries
  - url: https://registry2.example.com/libraries
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.registries).toHaveLength(2);
      expect(config.registries[0].url).toBe(
        "https://registry1.example.com/libraries"
      );
      expect(config.registries[1].url).toBe(
        "https://registry2.example.com/libraries"
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    test("static library entries are omitted from build output; registries config is stored", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries:
  static-lib: https://example.com/static/auth
registries:
  - url: https://registry.example.com/libraries
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.registries).toEqual([
        {
          url: "https://registry.example.com/libraries",
          refreshMinInterval: 60,
          refreshMaxInterval: 300
        }
      ]);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe("deprecated string format for libraries", () => {
    test("shows deprecation warning for string libraries format", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: https://registry.example.com/libraries
media_support: {}
      `;

      await parseConfig(yamlConfig);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "WARNING: Using a string for 'libraries' in config is deprecated"
        )
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "Please migrate to the 'registries' array format"
        )
      );
    });

    test("treats string libraries URL as a runtime registry entry; no build-time fetch", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: https://registry.example.com/libraries
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.registries).toEqual([
        {
          url: "https://registry.example.com/libraries",
          refreshMinInterval: 60,
          refreshMaxInterval: 300
        }
      ]);
      expect(fetch).not.toHaveBeenCalled();
    });

    test("deprecated URL is appended after any explicit registries entries", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: https://deprecated.example.com/libraries
registries:
  - url: https://explicit.example.com/libraries
    refreshMinInterval: 120
    refreshMaxInterval: 600
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.registries).toEqual([
        {
          url: "https://explicit.example.com/libraries",
          refreshMinInterval: 120,
          refreshMaxInterval: 600
        },
        {
          url: "https://deprecated.example.com/libraries",
          refreshMinInterval: 60,
          refreshMaxInterval: 300
        }
      ]);
    });
  });

  describe("backward compatibility", () => {
    test("handles config without registries field", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries:
  main-street: https://example.com/main-street/auth
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.registries).toEqual([]);
    });

    test("handles config without libraries field", async () => {
      const yamlConfig = `
instance_name: Test Instance
registries:
  - url: https://registry.example.com/libraries
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.registries).toHaveLength(1);
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});

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
    // Clear the module cache to get fresh instances
    jest.resetModules();

    // Mock node-fetch
    fetch = jest.fn();
    jest.doMock("node-fetch", () => fetch);

    // Import the module after mocking
    const configModule = require("../fetch-config");
    parseConfig = configModule.__parseConfigForTest;

    // Clear console.warn
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("static libraries config (object format)", () => {
    test("parses static libraries from object", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries:
  main-street: https://example.com/main-street/auth
  lyr-reads: https://example.com/lyr-reads/auth
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.libraries).toEqual({
        "main-street": {
          title: "main-street",
          authDocUrl: "https://example.com/main-street/auth"
        },
        "lyr-reads": {
          title: "lyr-reads",
          authDocUrl: "https://example.com/lyr-reads/auth"
        }
      });
      expect(config.registries).toEqual([]);
    });

    test("handles empty libraries object", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: {}
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.libraries).toEqual({});
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
          refreshMinInterval: 60, // default
          refreshMaxInterval: 300 // default
        }
      ]);
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
    test("parses both static libraries and registries", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries:
  featured-lib: https://example.com/featured/auth
registries:
  - url: https://registry.example.com/libraries
    refreshMinInterval: 60
    refreshMaxInterval: 300
media_support: {}
      `;

      const config = await parseConfig(yamlConfig);

      expect(config.libraries).toEqual({
        "featured-lib": {
          title: "featured-lib",
          authDocUrl: "https://example.com/featured/auth"
        }
      });
      expect(config.registries).toEqual([
        {
          url: "https://registry.example.com/libraries",
          refreshMinInterval: 60,
          refreshMaxInterval: 300
        }
      ]);
    });
  });

  describe("deprecated string format for libraries", () => {
    test("shows deprecation warning for string libraries format", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: https://registry.example.com/libraries
media_support: {}
      `;

      // Mock the fetch response for registry
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          catalogs: [
            {
              metadata: {
                id: "test-lib",
                title: "Test Library"
              },
              links: [
                {
                  type: "application/vnd.opds.authentication.v1.0+json",
                  href: "https://example.com/test-lib/auth"
                }
              ]
            }
          ]
        })
      });

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

    test("fetches libraries from registry when using string format", async () => {
      const yamlConfig = `
instance_name: Test Instance
libraries: https://registry.example.com/libraries
media_support: {}
      `;

      // Mock the fetch response for registry
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          catalogs: [
            {
              metadata: {
                id: "test-lib",
                title: "Test Library"
              },
              links: [
                {
                  type: "application/vnd.opds.authentication.v1.0+json",
                  href: "https://example.com/test-lib/auth"
                }
              ]
            }
          ]
        })
      });

      const config = await parseConfig(yamlConfig);

      expect(config.libraries).toEqual({
        "test-lib": {
          title: "Test Library",
          authDocUrl: "https://example.com/test-lib/auth"
        }
      });
      expect(config.registries).toEqual([]);
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

      expect(config.libraries).toBeDefined();
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

      expect(config.libraries).toEqual({});
      expect(config.registries).toHaveLength(1);
    });
  });
});

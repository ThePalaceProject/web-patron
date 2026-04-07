/**
 * @jest-environment node
 *
 * Unit tests for the server-side library registry manager.
 * Run under jest.config.node.js.
 */

import {
  shouldRefresh,
  fetchRegistryLibraries,
  getLibraries,
  resetRegistryCaches
} from "../libraryRegistry";
import type { AppConfig, RegistryConfig } from "interfaces";
import {
  DEFAULT_REGISTRY_REFRESH_MIN_INTERVAL,
  DEFAULT_REGISTRY_REFRESH_MAX_INTERVAL
} from "constants/registry";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const REGISTRY_URL = "https://registry.example.com/libraries";

function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    instanceName: "Test",
    gtmId: null,
    bugsnagApiKey: null,
    companionApp: "simplye",
    showMedium: true,
    openebooks: null,
    mediaSupport: {},
    libraries: {},
    ...overrides
  };
}

function makeRegistryConfig(
  overrides: Partial<RegistryConfig> = {}
): RegistryConfig {
  return { url: REGISTRY_URL, ...overrides };
}

/** Builds a minimal valid OPDS2 LibraryRegistryFeed JSON. */
function makeRegistryFeed(
  catalogs: Array<{ id: string; title: string; authDocUrl?: string }>
) {
  return {
    catalogs: catalogs.map(({ id, title, authDocUrl }) => ({
      metadata: { id, title, updated: "", description: "" },
      links: authDocUrl
        ? [
            {
              rel: "http://opds-spec.org/auth/document",
              type: "application/vnd.opds.authentication.v1.0+json",
              href: authDocUrl
            }
          ]
        : []
    }))
  };
}

/** Returns a jest mock that resolves with a successful JSON response. */
function mockFetchSuccess(body: unknown) {
  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => body
  });
}

/** Returns a jest mock that resolves with an HTTP error response. */
function mockFetchError(status = 500, statusText = "Internal Server Error") {
  return jest.fn().mockResolvedValue({
    ok: false,
    status,
    statusText,
    json: async () => ({})
  });
}

// ---------------------------------------------------------------------------
// shouldRefresh
// ---------------------------------------------------------------------------

describe("shouldRefresh", () => {
  const NOW = 1_000_000;

  it("returns true when state is undefined (never fetched)", () => {
    expect(shouldRefresh(undefined, makeRegistryConfig(), NOW)).toBe(true);
  });

  it("returns true when no successful fetch has occurred", () => {
    const state = {
      libraries: {},
      lastSuccessfulFetch: null,
      lastAttemptedFetch: null
    };
    expect(shouldRefresh(state, makeRegistryConfig(), NOW)).toBe(true);
  });

  it("returns false when last attempt was within min interval", () => {
    const state = {
      libraries: {},
      lastSuccessfulFetch: NOW - DEFAULT_REGISTRY_REFRESH_MAX_INTERVAL - 1,
      lastAttemptedFetch: NOW - (DEFAULT_REGISTRY_REFRESH_MIN_INTERVAL - 1)
    };
    expect(shouldRefresh(state, makeRegistryConfig(), NOW)).toBe(false);
  });

  it("returns false when data is fresh (within max interval)", () => {
    const state = {
      libraries: {},
      lastSuccessfulFetch: NOW - (DEFAULT_REGISTRY_REFRESH_MAX_INTERVAL - 1),
      lastAttemptedFetch: NOW - DEFAULT_REGISTRY_REFRESH_MAX_INTERVAL
    };
    expect(shouldRefresh(state, makeRegistryConfig(), NOW)).toBe(false);
  });

  it("returns true when data is stale (beyond max interval) and min interval respected", () => {
    const state = {
      libraries: {},
      lastSuccessfulFetch: NOW - DEFAULT_REGISTRY_REFRESH_MAX_INTERVAL - 1,
      lastAttemptedFetch: NOW - DEFAULT_REGISTRY_REFRESH_MIN_INTERVAL - 1
    };
    expect(shouldRefresh(state, makeRegistryConfig(), NOW)).toBe(true);
  });

  it("respects custom min and max intervals from config", () => {
    const config = makeRegistryConfig({
      refreshMinInterval: 10,
      refreshMaxInterval: 30
    });
    const freshState = {
      libraries: {},
      lastSuccessfulFetch: NOW - 29,
      lastAttemptedFetch: NOW - 11
    };
    expect(shouldRefresh(freshState, config, NOW)).toBe(false);

    const staleState = {
      libraries: {},
      lastSuccessfulFetch: NOW - 31,
      lastAttemptedFetch: NOW - 11
    };
    expect(shouldRefresh(staleState, config, NOW)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// fetchRegistryLibraries
// ---------------------------------------------------------------------------

describe("fetchRegistryLibraries", () => {
  beforeEach(() => {
    resetRegistryCaches();
  });

  it("returns a LibrariesConfig from a valid feed", async () => {
    const feed = makeRegistryFeed([
      {
        id: "urn:uuid:abc",
        title: "Library A",
        authDocUrl: "https://a.example.com/auth"
      },
      {
        id: "urn:uuid:def",
        title: "Library B",
        authDocUrl: "https://b.example.com/auth"
      }
    ]);
    global.fetch = mockFetchSuccess(feed) as unknown as typeof fetch;

    const result = await fetchRegistryLibraries(REGISTRY_URL);

    expect(result).toEqual({
      "urn:uuid:abc": {
        title: "Library A",
        authDocUrl: "https://a.example.com/auth"
      },
      "urn:uuid:def": {
        title: "Library B",
        authDocUrl: "https://b.example.com/auth"
      }
    });
  });

  it("skips catalogs missing an auth document link", async () => {
    const feed = makeRegistryFeed([
      {
        id: "urn:uuid:abc",
        title: "Library A",
        authDocUrl: "https://a.example.com/auth"
      },
      { id: "urn:uuid:no-auth", title: "No Auth Library" }
    ]);
    global.fetch = mockFetchSuccess(feed) as unknown as typeof fetch;

    const result = await fetchRegistryLibraries(REGISTRY_URL);

    expect(Object.keys(result)).toEqual(["urn:uuid:abc"]);
  });

  it("throws when the response is not ok", async () => {
    global.fetch = mockFetchError(
      503,
      "Service Unavailable"
    ) as unknown as typeof fetch;

    await expect(fetchRegistryLibraries(REGISTRY_URL)).rejects.toThrow("503");
  });

  it("throws when the feed has no catalogs field", async () => {
    global.fetch = mockFetchSuccess({
      metadata: { title: "Registry" }
    }) as unknown as typeof fetch;

    await expect(fetchRegistryLibraries(REGISTRY_URL)).rejects.toThrow(
      "catalogs"
    );
  });
});

// ---------------------------------------------------------------------------
// getLibraries
// ---------------------------------------------------------------------------

describe("getLibraries", () => {
  beforeEach(() => {
    resetRegistryCaches();
  });

  it("returns static libraries when no registries are configured", async () => {
    const config = makeConfig({
      libraries: {
        "my-lib": { title: "My Lib", authDocUrl: "https://my.lib/auth" }
      }
    });

    const result = await getLibraries(config);

    expect(result).toEqual(config.libraries);
    // fetch should never be called.
    expect(global.fetch).not.toHaveBeenCalled?.();
  });

  it("fetches from registry and returns merged libraries", async () => {
    const feed = makeRegistryFeed([
      {
        id: "urn:uuid:reg",
        title: "Registry Lib",
        authDocUrl: "https://r.example.com/auth"
      }
    ]);
    global.fetch = mockFetchSuccess(feed) as unknown as typeof fetch;

    const config = makeConfig({
      registries: [{ url: REGISTRY_URL }]
    });

    const result = await getLibraries(config);

    expect(result["urn:uuid:reg"]).toEqual({
      title: "Registry Lib",
      authDocUrl: "https://r.example.com/auth"
    });
  });

  it("static libraries override registry libraries with the same key", async () => {
    const feed = makeRegistryFeed([
      {
        id: "urn:uuid:shared",
        title: "Registry Version",
        authDocUrl: "https://r.example.com/auth"
      }
    ]);
    global.fetch = mockFetchSuccess(feed) as unknown as typeof fetch;

    const config = makeConfig({
      libraries: {
        "urn:uuid:shared": {
          title: "Static Version",
          authDocUrl: "https://static.example.com/auth"
        }
      },
      registries: [{ url: REGISTRY_URL }]
    });

    const result = await getLibraries(config);

    expect(result["urn:uuid:shared"]?.title).toBe("Static Version");
  });

  it("retains cached state when registry fetch fails", async () => {
    // First call succeeds and populates the cache.
    const feed = makeRegistryFeed([
      {
        id: "urn:uuid:cached",
        title: "Cached Lib",
        authDocUrl: "https://cached.example.com/auth"
      }
    ]);
    global.fetch = mockFetchSuccess(feed) as unknown as typeof fetch;

    const minInterval = 1;
    const maxInterval = 2;
    const config = makeConfig({
      registries: [
        {
          url: REGISTRY_URL,
          refreshMinInterval: minInterval,
          refreshMaxInterval: maxInterval
        }
      ]
    });

    await getLibraries(config);

    // Advance time past maxInterval so a refresh is triggered.
    const originalNow = Date.now;
    Date.now = () => originalNow() + (maxInterval + 1) * 1000;

    // Second call fails.
    global.fetch = mockFetchError() as unknown as typeof fetch;

    const result = await getLibraries(config);

    // Should still have cached library, not an empty result.
    expect(result["urn:uuid:cached"]).toBeDefined();

    Date.now = originalNow;
  });

  it("does not re-fetch before min interval has elapsed", async () => {
    const feed = makeRegistryFeed([
      { id: "urn:uuid:a", title: "A", authDocUrl: "https://a.example.com/auth" }
    ]);
    const fetchMock = mockFetchSuccess(feed);
    global.fetch = fetchMock as unknown as typeof fetch;

    const config = makeConfig({
      registries: [
        { url: REGISTRY_URL, refreshMinInterval: 60, refreshMaxInterval: 1 }
      ]
    });

    // First call fetches.
    await getLibraries(config);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Second call - data is stale (maxInterval=1s elapsed) but min interval not respected.
    // The fetch mock last attempt was just now, so min interval blocks it.
    await getLibraries(config);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("gives earlier registries precedence over later ones for the same key", async () => {
    const REGISTRY_URL_2 = "https://registry2.example.com/libraries";

    const feed1 = makeRegistryFeed([
      {
        id: "urn:uuid:shared",
        title: "First Registry Version",
        authDocUrl: "https://r1.example.com/auth"
      }
    ]);
    const feed2 = makeRegistryFeed([
      {
        id: "urn:uuid:shared",
        title: "Second Registry Version",
        authDocUrl: "https://r2.example.com/auth"
      }
    ]);

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => feed1
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => feed2
      }) as unknown as typeof fetch;

    const config = makeConfig({
      registries: [{ url: REGISTRY_URL }, { url: REGISTRY_URL_2 }]
    });

    const result = await getLibraries(config);

    expect(result["urn:uuid:shared"]?.title).toBe("First Registry Version");
  });
});

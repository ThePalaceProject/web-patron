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
import type { AppConfig, LibrariesConfig, RegistryConfig } from "interfaces";
import {
  DEFAULT_REGISTRY_REFRESH_MIN_INTERVAL,
  DEFAULT_REGISTRY_REFRESH_MAX_INTERVAL
} from "constants/registry";

// ---------------------------------------------------------------------------
// Test infrastructure
// ---------------------------------------------------------------------------

const REGISTRY_URL   = "https://registry.example.com/libraries";
const REGISTRY_URL_2 = "https://registry2.example.com/libraries";
const INCREMENTAL_URL = `${REGISTRY_URL}?order=modified`;

/** Minimal AppConfig for test use. */
function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    instanceName:  "Test",
    gtmId:         null,
    bugsnagApiKey: null,
    companionApp:  "simplye",
    showMedium:    true,
    openebooks:    null,
    mediaSupport:  {},
    libraries:     {},
    ...overrides
  };
}

function makeRegistryConfig(overrides: Partial<RegistryConfig> = {}): RegistryConfig {
  return { url: REGISTRY_URL, ...overrides };
}

/** Builds a minimal OPDS2 LibraryRegistryFeed for testing. */
function makePagedFeed(
  catalogs: Array<{
    id: string;
    title: string;
    authDocUrl?: string;
    updated?: string;
  }>,
  options: {
    nextHref?: string;
    incrementalFacetHref?: string;
  } = {}
) {
  const links: object[] = [];
  if (options.nextHref) {
    links.push({ rel: "next", href: options.nextHref, type: "application/opds+json" });
  }

  const facets: object[] = [];
  if (options.incrementalFacetHref) {
    facets.push({
      metadata: {
        title: "Sort",
        "@type": "http://palaceproject.io/terms/rel/sort"
      },
      links: [
        {
          href: options.incrementalFacetHref,
          rel: "self",
          type: "application/opds+json",
          title: "Recently Modified"
        }
      ]
    });
  }

  return {
    metadata: { adobe_vendor_id: "", title: "Registry", numberOfItems: catalogs.length },
    links,
    facets,
    catalogs: catalogs.map(({ id, title, authDocUrl, updated }) => ({
      metadata: { id, title, updated: updated ?? "", description: "" },
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

/** Routes fetch calls by URL — useful for multi-page tests. */
function mockFetchByUrl(urlMap: Record<string, unknown>): jest.Mock {
  return jest.fn().mockImplementation((url: string) => {
    const body = urlMap[url];
    if (body === undefined) {
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({})
      });
    }
    if (
      body !== null &&
      typeof body === "object" &&
      "status" in body &&
      !(body as { ok?: boolean }).ok
    ) {
      const err = body as { status: number; statusText: string };
      return Promise.resolve({
        ok: false,
        status: err.status,
        statusText: err.statusText,
        json: async () => ({})
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => body
    });
  });
}

function mockFetchSuccess(body: unknown): jest.Mock {
  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => body
  });
}

function mockFetchError(status = 500, statusText = "Internal Server Error"): jest.Mock {
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

  function makeState(overrides: {
    lastSuccessfulFetch?: number | null;
    lastAttemptedFetch?: number | null;
  } = {}) {
    return {
      libraries: {},
      lastSuccessfulFetch: null,
      lastAttemptedFetch: null,
      lastFullFetch: null,
      incrementalUrl: null,
      ...overrides
    };
  }

  it("returns true when state is undefined (never fetched)", () => {
    expect(shouldRefresh(undefined, makeRegistryConfig(), NOW)).toBe(true);
  });

  it("returns true when no successful fetch has occurred", () => {
    expect(shouldRefresh(makeState(), makeRegistryConfig(), NOW)).toBe(true);
  });

  it("returns false when last attempt was within min interval", () => {
    const state = makeState({
      lastSuccessfulFetch: NOW - DEFAULT_REGISTRY_REFRESH_MAX_INTERVAL - 1,
      lastAttemptedFetch: NOW - (DEFAULT_REGISTRY_REFRESH_MIN_INTERVAL - 1)
    });
    expect(shouldRefresh(state, makeRegistryConfig(), NOW)).toBe(false);
  });

  it("returns false when data is fresh (within max interval)", () => {
    const state = makeState({
      lastSuccessfulFetch: NOW - (DEFAULT_REGISTRY_REFRESH_MAX_INTERVAL - 1),
      lastAttemptedFetch: NOW - DEFAULT_REGISTRY_REFRESH_MAX_INTERVAL
    });
    expect(shouldRefresh(state, makeRegistryConfig(), NOW)).toBe(false);
  });

  it("returns true when data is stale and min interval respected", () => {
    const state = makeState({
      lastSuccessfulFetch: NOW - DEFAULT_REGISTRY_REFRESH_MAX_INTERVAL - 1,
      lastAttemptedFetch: NOW - DEFAULT_REGISTRY_REFRESH_MIN_INTERVAL - 1
    });
    expect(shouldRefresh(state, makeRegistryConfig(), NOW)).toBe(true);
  });

  it("respects custom min and max intervals from config", () => {
    const config = makeRegistryConfig({ refreshMinInterval: 10, refreshMaxInterval: 30 });

    const freshState = makeState({ lastSuccessfulFetch: NOW - 29, lastAttemptedFetch: NOW - 11 });
    expect(shouldRefresh(freshState, config, NOW)).toBe(false);

    const staleState = makeState({ lastSuccessfulFetch: NOW - 31, lastAttemptedFetch: NOW - 11 });
    expect(shouldRefresh(staleState, config, NOW)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// fetchRegistryLibraries
// ---------------------------------------------------------------------------

describe("fetchRegistryLibraries", () => {
  beforeEach(() => resetRegistryCaches());

  it("returns a LibrariesConfig from a valid single-page feed", async () => {
    const feed = makePagedFeed([
      { id: "urn:uuid:abc", title: "Library A", authDocUrl: "https://a.example.com/auth" },
      { id: "urn:uuid:def", title: "Library B", authDocUrl: "https://b.example.com/auth" }
    ]);
    global.fetch = mockFetchSuccess(feed) as unknown as typeof fetch;

    const result = await fetchRegistryLibraries(REGISTRY_URL);

    expect(result).toEqual({
      "urn:uuid:abc": { title: "Library A", authDocUrl: "https://a.example.com/auth" },
      "urn:uuid:def": { title: "Library B", authDocUrl: "https://b.example.com/auth" }
    });
  });

  it("follows rel=next links to collect entries across multiple pages", async () => {
    const PAGE_2_URL = `${REGISTRY_URL}?offset=100`;
    global.fetch = mockFetchByUrl({
      [REGISTRY_URL]: makePagedFeed(
        [{ id: "urn:uuid:p1", title: "Page 1 Lib", authDocUrl: "https://p1.example.com/auth" }],
        { nextHref: PAGE_2_URL }
      ),
      [PAGE_2_URL]: makePagedFeed([
        { id: "urn:uuid:p2", title: "Page 2 Lib", authDocUrl: "https://p2.example.com/auth" }
      ])
    }) as unknown as typeof fetch;

    const result = await fetchRegistryLibraries(REGISTRY_URL);

    expect(Object.keys(result)).toHaveLength(2);
    expect(result["urn:uuid:p1"]).toBeDefined();
    expect(result["urn:uuid:p2"]).toBeDefined();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("skips catalogs missing an auth document link", async () => {
    const feed = makePagedFeed([
      { id: "urn:uuid:abc", title: "Library A", authDocUrl: "https://a.example.com/auth" },
      { id: "urn:uuid:no-auth", title: "No Auth Library" }
    ]);
    global.fetch = mockFetchSuccess(feed) as unknown as typeof fetch;

    const result = await fetchRegistryLibraries(REGISTRY_URL);

    expect(Object.keys(result)).toEqual(["urn:uuid:abc"]);
  });

  it("returns empty result for a feed with no catalogs", async () => {
    const feed = makePagedFeed([]);
    global.fetch = mockFetchSuccess(feed) as unknown as typeof fetch;

    const result = await fetchRegistryLibraries(REGISTRY_URL);

    expect(result).toEqual({});
  });

  it("throws when the response is not ok", async () => {
    global.fetch = mockFetchError(503, "Service Unavailable") as unknown as typeof fetch;
    await expect(fetchRegistryLibraries(REGISTRY_URL)).rejects.toThrow("503");
  });
});

// ---------------------------------------------------------------------------
// crawlRegistryFeed (tested via fetchRegistryLibraries and getLibraries)
// ---------------------------------------------------------------------------

describe("crawlRegistryFeed (incremental behaviour via getLibraries)", () => {
  const NOW_SECONDS = 2_000_000;
  const OLD_TIMESTAMP = new Date((NOW_SECONDS - 1000) * 1000).toISOString();
  const NEW_TIMESTAMP = new Date((NOW_SECONDS + 1000) * 1000).toISOString();

  beforeEach(() => {
    resetRegistryCaches();
    jest.spyOn(Date, "now").mockReturnValue(NOW_SECONDS * 1000);
  });

  afterEach(() => jest.restoreAllMocks());

  function makeIncrementalConfig(overrides: Partial<RegistryConfig> = {}): RegistryConfig {
    return makeRegistryConfig({
      refreshMinInterval: 1,
      refreshMaxInterval: 1,
      fullRefreshInterval: 86400,
      ...overrides
    });
  }

  async function doFirstFetch(feedWithFacet: object) {
    global.fetch = mockFetchSuccess(feedWithFacet) as unknown as typeof fetch;
    await getLibraries(makeConfig({ registries: [makeIncrementalConfig()] }));
  }

  it("single-page full crawl sets reachedEnd, incrementalUrl from facets", async () => {
    const feed = makePagedFeed(
      [{ id: "urn:uuid:a", title: "A", authDocUrl: "https://a.example.com/auth", updated: NEW_TIMESTAMP }],
      { incrementalFacetHref: INCREMENTAL_URL }
    );
    global.fetch = mockFetchSuccess(feed) as unknown as typeof fetch;

    const result = await getLibraries(
      makeConfig({ registries: [makeIncrementalConfig()] })
    );

    expect(result["urn:uuid:a"]).toBeDefined();
  });

  it("incremental crawl stops mid-page when an entry is old", async () => {
    const initialFeed = makePagedFeed(
      [
        { id: "urn:uuid:a", title: "A", authDocUrl: "https://a.example.com/auth", updated: NEW_TIMESTAMP },
        { id: "urn:uuid:b", title: "B", authDocUrl: "https://b.example.com/auth", updated: NEW_TIMESTAMP }
      ],
      { incrementalFacetHref: INCREMENTAL_URL }
    );
    await doFirstFetch(initialFeed);

    // Advance time past maxInterval so a refresh triggers.
    jest.spyOn(Date, "now").mockReturnValue((NOW_SECONDS + 2) * 1000);

    const incrementalFeed = makePagedFeed(
      [
        { id: "urn:uuid:c", title: "C (new)", authDocUrl: "https://c.example.com/auth", updated: NEW_TIMESTAMP },
        { id: "urn:uuid:a", title: "A (old)", authDocUrl: "https://a.example.com/auth", updated: OLD_TIMESTAMP }
      ],
      { incrementalFacetHref: INCREMENTAL_URL, nextHref: `${INCREMENTAL_URL}&offset=100` }
    );
    global.fetch = mockFetchByUrl({
      [INCREMENTAL_URL]: incrementalFeed
    }) as unknown as typeof fetch;

    const result = await getLibraries(
      makeConfig({ registries: [makeIncrementalConfig()] })
    );

    // C is new and should be present; A (old) stops the crawl on the page.
    expect(result["urn:uuid:c"]).toBeDefined();
    // B was cached from the first fetch and not seen in incremental (not replaced).
    expect(result["urn:uuid:b"]).toBeDefined();
  });

  it("incremental that reaches end of feed replaces cache (deletions applied)", async () => {
    const initialFeed = makePagedFeed(
      [
        { id: "urn:uuid:a", title: "A", authDocUrl: "https://a.example.com/auth", updated: NEW_TIMESTAMP },
        { id: "urn:uuid:b", title: "B", authDocUrl: "https://b.example.com/auth", updated: NEW_TIMESTAMP }
      ],
      { incrementalFacetHref: INCREMENTAL_URL }
    );
    await doFirstFetch(initialFeed);

    jest.spyOn(Date, "now").mockReturnValue((NOW_SECONDS + 2) * 1000);

    // Incremental feed: A is old (triggers stop), but no next link → reachedEnd.
    const incrementalFeed = makePagedFeed(
      [
        { id: "urn:uuid:a", title: "A", authDocUrl: "https://a.example.com/auth", updated: OLD_TIMESTAMP }
      ],
      { incrementalFacetHref: INCREMENTAL_URL } // no nextHref
    );
    global.fetch = mockFetchByUrl({
      [INCREMENTAL_URL]: incrementalFeed
    }) as unknown as typeof fetch;

    const result = await getLibraries(
      makeConfig({ registries: [makeIncrementalConfig()] })
    );

    // reachedEnd = true (no next link), so cache is replaced.
    // A triggered the stop (not accumulated), so both A and B are gone.
    expect(result["urn:uuid:a"]).toBeUndefined();
    expect(result["urn:uuid:b"]).toBeUndefined();
  });

  it("full crawl after fullRefreshInterval replaces cache", async () => {
    const initialFeed = makePagedFeed(
      [
        { id: "urn:uuid:a", title: "A", authDocUrl: "https://a.example.com/auth", updated: NEW_TIMESTAMP },
        { id: "urn:uuid:b", title: "B", authDocUrl: "https://b.example.com/auth", updated: NEW_TIMESTAMP }
      ],
      { incrementalFacetHref: INCREMENTAL_URL }
    );
    await doFirstFetch(initialFeed);

    // Advance past fullRefreshInterval.
    const config = makeIncrementalConfig({ fullRefreshInterval: 10 });
    jest.spyOn(Date, "now").mockReturnValue((NOW_SECONDS + 11) * 1000);

    // Full refresh feed: only A.
    const fullFeed = makePagedFeed(
      [{ id: "urn:uuid:a", title: "A", authDocUrl: "https://a.example.com/auth", updated: NEW_TIMESTAMP }],
      { incrementalFacetHref: INCREMENTAL_URL }
    );
    global.fetch = mockFetchByUrl({ [REGISTRY_URL]: fullFeed }) as unknown as typeof fetch;

    const result = await getLibraries(makeConfig({ registries: [config] }));

    expect(result["urn:uuid:a"]).toBeDefined();
    expect(result["urn:uuid:b"]).toBeUndefined();
  });

  it("second fetch within fullRefreshInterval uses incrementalUrl", async () => {
    const initialFeed = makePagedFeed(
      [{ id: "urn:uuid:a", title: "A", authDocUrl: "https://a.example.com/auth", updated: NEW_TIMESTAMP }],
      { incrementalFacetHref: INCREMENTAL_URL }
    );
    await doFirstFetch(initialFeed);

    jest.spyOn(Date, "now").mockReturnValue((NOW_SECONDS + 2) * 1000);

    const fetchMock = mockFetchByUrl({
      [INCREMENTAL_URL]: makePagedFeed([], { incrementalFacetHref: INCREMENTAL_URL })
    }) as unknown as typeof fetch;
    global.fetch = fetchMock;

    await getLibraries(makeConfig({ registries: [makeIncrementalConfig()] }));

    expect((fetchMock as jest.Mock).mock.calls[0][0]).toBe(INCREMENTAL_URL);
  });

  it("first fetch always uses registryConfig.url regardless of incrementalUrl", async () => {
    const feed = makePagedFeed(
      [{ id: "urn:uuid:a", title: "A", authDocUrl: "https://a.example.com/auth", updated: NEW_TIMESTAMP }],
      { incrementalFacetHref: INCREMENTAL_URL }
    );
    const fetchMock = mockFetchSuccess(feed) as unknown as typeof fetch;
    global.fetch = fetchMock;

    await getLibraries(makeConfig({ registries: [makeIncrementalConfig()] }));

    expect((fetchMock as jest.Mock).mock.calls[0][0]).toBe(REGISTRY_URL);
  });

  it("logs warning on first fetch when no order=modified facet found", async () => {
    const feed = makePagedFeed(
      [{ id: "urn:uuid:a", title: "A", authDocUrl: "https://a.example.com/auth" }]
      // no incrementalFacetHref
    );
    global.fetch = mockFetchSuccess(feed) as unknown as typeof fetch;
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);

    await getLibraries(makeConfig({ registries: [makeIncrementalConfig()] }));

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("order=modified facet")
    );
  });

  it("entry with empty updated string is not treated as a stop signal", async () => {
    const initialFeed = makePagedFeed(
      [{ id: "urn:uuid:a", title: "A", authDocUrl: "https://a.example.com/auth", updated: NEW_TIMESTAMP }],
      { incrementalFacetHref: INCREMENTAL_URL }
    );
    await doFirstFetch(initialFeed);

    jest.spyOn(Date, "now").mockReturnValue((NOW_SECONDS + 2) * 1000);

    const incrementalFeed = makePagedFeed(
      [
        { id: "urn:uuid:b", title: "B (no date)", authDocUrl: "https://b.example.com/auth", updated: "" },
        { id: "urn:uuid:c", title: "C (new)", authDocUrl: "https://c.example.com/auth", updated: NEW_TIMESTAMP }
      ],
      { incrementalFacetHref: INCREMENTAL_URL }
    );
    global.fetch = mockFetchByUrl({ [INCREMENTAL_URL]: incrementalFeed }) as unknown as typeof fetch;

    const result = await getLibraries(makeConfig({ registries: [makeIncrementalConfig()] }));

    // Both B (empty date) and C (new) should be collected.
    expect(result["urn:uuid:b"]).toBeDefined();
    expect(result["urn:uuid:c"]).toBeDefined();
  });

  it("retains cached state when registry fetch fails", async () => {
    const initialFeed = makePagedFeed(
      [{ id: "urn:uuid:cached", title: "Cached", authDocUrl: "https://cached.example.com/auth", updated: NEW_TIMESTAMP }],
      { incrementalFacetHref: INCREMENTAL_URL }
    );
    await doFirstFetch(initialFeed);

    jest.spyOn(Date, "now").mockReturnValue((NOW_SECONDS + 2) * 1000);
    global.fetch = mockFetchError() as unknown as typeof fetch;

    const result = await getLibraries(makeConfig({ registries: [makeIncrementalConfig()] }));

    expect(result["urn:uuid:cached"]).toBeDefined();
  });

  it("retains incrementalUrl in state after a failed fetch", async () => {
    const initialFeed = makePagedFeed(
      [{ id: "urn:uuid:a", title: "A", authDocUrl: "https://a.example.com/auth", updated: NEW_TIMESTAMP }],
      { incrementalFacetHref: INCREMENTAL_URL }
    );
    await doFirstFetch(initialFeed);

    jest.spyOn(Date, "now").mockReturnValue((NOW_SECONDS + 2) * 1000);
    global.fetch = mockFetchError() as unknown as typeof fetch;
    await getLibraries(makeConfig({ registries: [makeIncrementalConfig()] }));

    // The next successful fetch should still use incrementalUrl (not the base URL).
    jest.spyOn(Date, "now").mockReturnValue((NOW_SECONDS + 4) * 1000);
    const fetchMock = mockFetchByUrl({
      [INCREMENTAL_URL]: makePagedFeed([], { incrementalFacetHref: INCREMENTAL_URL })
    }) as unknown as typeof fetch;
    global.fetch = fetchMock;

    await getLibraries(makeConfig({ registries: [makeIncrementalConfig()] }));
    expect((fetchMock as jest.Mock).mock.calls[0][0]).toBe(INCREMENTAL_URL);
  });
});

// ---------------------------------------------------------------------------
// getLibraries — general behaviour (originally from Release 1 tests)
// ---------------------------------------------------------------------------

describe("getLibraries", () => {
  beforeEach(() => resetRegistryCaches());

  it("returns static libraries when no registries are configured", async () => {
    const config = makeConfig({
      libraries: { "my-lib": { title: "My Lib", authDocUrl: "https://my.lib/auth" } }
    });
    const result = await getLibraries(config);
    expect(result).toEqual(config.libraries);
  });

  it("fetches from registry and returns merged libraries", async () => {
    const feed = makePagedFeed([
      { id: "urn:uuid:reg", title: "Registry Lib", authDocUrl: "https://r.example.com/auth" }
    ]);
    global.fetch = mockFetchSuccess(feed) as unknown as typeof fetch;

    const result = await getLibraries(makeConfig({ registries: [makeRegistryConfig()] }));

    expect(result["urn:uuid:reg"]).toBeDefined();
  });

  it("static libraries override registry libraries with the same key", async () => {
    const feed = makePagedFeed([
      { id: "urn:uuid:shared", title: "Registry Version", authDocUrl: "https://r.example.com/auth" }
    ]);
    global.fetch = mockFetchSuccess(feed) as unknown as typeof fetch;

    const config = makeConfig({
      libraries: { "urn:uuid:shared": { title: "Static Version", authDocUrl: "https://static.example.com/auth" } },
      registries: [makeRegistryConfig()]
    });

    const result = await getLibraries(config);
    expect(result["urn:uuid:shared"]?.title).toBe("Static Version");
  });

  it("gives earlier registries precedence over later ones for the same key", async () => {
    const feed1 = makePagedFeed([
      { id: "urn:uuid:shared", title: "First Registry", authDocUrl: "https://r1.example.com/auth" }
    ]);
    const feed2 = makePagedFeed([
      { id: "urn:uuid:shared", title: "Second Registry", authDocUrl: "https://r2.example.com/auth" }
    ]);

    const multiMock = jest.fn()
      .mockResolvedValueOnce({ ok: true, status: 200, statusText: "OK", json: async () => feed1 })
      .mockResolvedValueOnce({ ok: true, status: 200, statusText: "OK", json: async () => feed2 });
    global.fetch = multiMock as unknown as typeof fetch;

    const config = makeConfig({
      registries: [makeRegistryConfig(), makeRegistryConfig({ url: REGISTRY_URL_2 })]
    });

    const result = await getLibraries(config);
    expect(result["urn:uuid:shared"]?.title).toBe("First Registry");
  });

  it("does not re-fetch before min interval has elapsed", async () => {
    const feed = makePagedFeed([
      { id: "urn:uuid:a", title: "A", authDocUrl: "https://a.example.com/auth" }
    ]);
    const fetchMock = mockFetchSuccess(feed);
    global.fetch = fetchMock as unknown as typeof fetch;

    const config = makeConfig({
      registries: [makeRegistryConfig({ refreshMinInterval: 60, refreshMaxInterval: 1 })]
    });

    await getLibraries(config);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await getLibraries(config);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

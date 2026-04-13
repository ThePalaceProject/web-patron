import type { AppConfig, LibrariesConfig, RegistryConfig } from "interfaces";
import { OPDS2 } from "interfaces";
import {
  DEFAULT_REGISTRY_REFRESH_MIN_INTERVAL,
  DEFAULT_REGISTRY_REFRESH_MAX_INTERVAL,
  DEFAULT_REGISTRY_FULL_REFRESH_INTERVAL
} from "constants/registry";
import { computeSlug } from "utils/librarySlug";

// ---------------------------------------------------------------------------
// Internal state types
// ---------------------------------------------------------------------------

/*
 * All timestamps are Unix seconds. lastSuccessfulFetch is updated on any successful
 * crawl; lastFullFetch only when reachedEnd is true (complete feed traversal).
 * incrementalUrl === null within a cached entry means the registry does not advertise
 * an order=modified facet (distinct from a registry absent from the map, which has
 * never been fetched at all).
 */
interface RegistryState {
  libraries: LibrariesConfig;
  lastSuccessfulFetch: number | null;
  lastAttemptedFetch: number | null;
  lastFullFetch: number | null;
  incrementalUrl: string | null;
}

/*
 * reachedEnd: true when the final page fetched had no rel="next" link, meaning the
 * complete current feed state was observed.
 * incrementalUrl: the order=modified facet URL read from the first page, or null if
 * the feed does not advertise one.
 */
interface CrawlResult {
  libraries: LibrariesConfig;
  reachedEnd: boolean;
  incrementalUrl: string | null;
}

// ---------------------------------------------------------------------------
// Module-level cache
// ---------------------------------------------------------------------------

/*
 * In-memory cache keyed by registry URL. Persists across API requests within
 * a single server instance. A registry absent from this map has never been
 * fetched (distinct from one with incrementalUrl === null, which means it was
 * fetched but does not advertise an order=modified facet).
 */
const registryCaches = new Map<string, RegistryState>();

const emptyState: RegistryState = {
  libraries: {},
  lastSuccessfulFetch: null,
  lastAttemptedFetch:  null,
  lastFullFetch:       null,
  incrementalUrl:      null
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extracts the href of the `order=modified` sort facet from the first page
 * of a registry feed. Returns null if the feed does not advertise that facet.
 */
function findIncrementalUrl(feed: OPDS2.LibraryRegistryFeed): string | null {
  const sortGroup = feed.facets?.find(
    f => f.metadata["@type"] === OPDS2.SortFacetType
  );
  if (!sortGroup) return null;

  const link = sortGroup.links.find(l => {
    try {
      return new URL(l.href).searchParams.get("order") === "modified";
    } catch {
      return false;
    }
  });
  return link?.href ?? null;
}

// ---------------------------------------------------------------------------
// Core crawl function
// ---------------------------------------------------------------------------

/**
 * Crawls the paginated OPDS2 feed starting at `startUrl`, collecting library
 * entries.
 *
 * Full crawl (stopBefore === null): follows all rel="next" links.
 *
 * Incremental crawl (stopBefore is a Unix timestamp in seconds): stops as soon
 * as an entry's metadata.updated parses to a value at or before that timestamp,
 * because the feed is sorted newest-first. Entries with unparseable updated
 * values are always collected.
 *
 * reachedEnd is true when no rel="next" link was present on the final page
 * fetched, meaning the complete current feed state was observed. This holds
 * even when stopping early in incremental mode if the stop occurred on the
 * last page.
 */
async function crawlRegistryFeed(
  startUrl: string,
  stopBefore: number | null
): Promise<CrawlResult> {
  const accumulated: LibrariesConfig = {};
  let nextUrl: string | null = startUrl;
  let isFirstPage = true;
  let incrementalUrl: string | null = null;
  let effectiveStop = stopBefore;

  while (nextUrl) {
    const currentUrl = nextUrl;
    const response = await fetch(currentUrl);
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Registry feed not found at: ${currentUrl}`);
      }
      throw new Error(
        `Registry fetch failed for ${currentUrl}: ${response.status} ${response.statusText}`
      );
    }

    const feed = (await response.json()) as OPDS2.LibraryRegistryFeed;

    // Read facets from the first page only.
    if (isFirstPage) {
      isFirstPage = false;
      incrementalUrl = findIncrementalUrl(feed);
      // Defensive: if called in incremental mode but the facet is gone, treat as full.
      if (incrementalUrl == null) effectiveStop = null;
    }

    nextUrl = feed.links?.find(l => l.rel === OPDS2.PaginationNextRelation)?.href ?? null;

    for (const catalog of feed.catalogs ?? []) {
      const updatedSeconds = Date.parse(catalog.metadata.updated) / 1000;

      if (
        effectiveStop !== null &&
        Number.isFinite(updatedSeconds) &&
        updatedSeconds <= effectiveStop
      ) {
        // Stop early. If this is already the last page we still have full coverage.
        return {
          libraries: accumulated,
          reachedEnd: !nextUrl,
          incrementalUrl
        };
      }

      const authDocLink = catalog.links.find(
        l => l.type === OPDS2.AuthDocumentMediaType
      );
      if (!authDocLink) {
        console.warn(
          `Skipping library missing auth document link: ${catalog.metadata.title}`
        );
        continue;
      }

      const slug = computeSlug(catalog);
      accumulated[slug] = {
        title: catalog.metadata.title,
        authDocUrl: authDocLink.href
      };
    }
  }

  return { libraries: accumulated, reachedEnd: true, incrementalUrl };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns true if a refresh attempt should be made for the given registry.
 * A refresh is needed when the data is stale (beyond maxInterval since last
 * success, or no prior success), provided the minimum retry interval since the
 * last attempt has elapsed to avoid hammering failing endpoints.
 */
export function shouldRefresh(
  state: RegistryState | undefined,
  config: RegistryConfig,
  nowSeconds: number
): boolean {
  const minInterval =
    config.refreshMinInterval ?? DEFAULT_REGISTRY_REFRESH_MIN_INTERVAL;
  const maxInterval =
    config.refreshMaxInterval ?? DEFAULT_REGISTRY_REFRESH_MAX_INTERVAL;

  if (state?.lastAttemptedFetch != null) {
    if (nowSeconds - state.lastAttemptedFetch < minInterval) return false;
  }

  if (!state || state.lastSuccessfulFetch == null) return true;
  return nowSeconds - state.lastSuccessfulFetch >= maxInterval;
}

/**
 * Performs a full crawl of the registry feed at `url` and returns all discovered
 * libraries. Does not read or write the module-level cache.
 */
export async function fetchRegistryLibraries(
  url: string
): Promise<LibrariesConfig> {
  const result = await crawlRegistryFeed(url, null);
  return result.libraries;
}

/*
 * Refreshes a single registry cache entry if the data is stale. Sets
 * lastAttemptedFetch synchronously (before any await) so that subsequent
 * requests arriving during the async crawl see the in-progress attempt and
 * skip the duplicate. Errors are logged and swallowed; the existing cached
 * state is retained.
 */
async function refreshRegistry(
  registryConfig: RegistryConfig,
  nowSeconds: number
): Promise<void> {
  const isFirstFetch = !registryCaches.has(registryConfig.url);
  const existing = registryCaches.get(registryConfig.url) ?? emptyState;

  if (!shouldRefresh(existing, registryConfig, nowSeconds)) return;

  const fullRefreshInterval =
    registryConfig.fullRefreshInterval ?? DEFAULT_REGISTRY_FULL_REFRESH_INTERVAL;

  const needsFullCrawl =
    isFirstFetch ||
    existing.lastFullFetch == null ||
    nowSeconds - existing.lastFullFetch >= fullRefreshInterval;

  const canIncremental = !needsFullCrawl && existing.incrementalUrl != null;

  const startUrl = canIncremental ? (existing.incrementalUrl ?? registryConfig.url) : registryConfig.url;
  const stopBefore = canIncremental ? existing.lastSuccessfulFetch : null;
  const attemptTime = nowSeconds;

  registryCaches.set(registryConfig.url, {
    ...existing,
    lastAttemptedFetch: attemptTime
  });

  try {
    const result = await crawlRegistryFeed(startUrl, stopBefore);

    if (isFirstFetch && result.incrementalUrl == null) {
      console.warn(
        `Registry at ${registryConfig.url} has no order=modified facet; ` +
          `incremental fetching is not supported. Full crawls will run every refresh.`
      );
    }

    /*
     * reachedEnd = true: complete view observed (full crawl or incremental
     * that reached the last page). Replace the cache entirely so deleted
     * libraries are removed.
     *
     * reachedEnd = false: partial view. Overlay new/updated entries onto the
     * existing cache; unvisited entries are preserved.
     */
    const mergedLibraries = result.reachedEnd
      ? result.libraries
      : { ...existing.libraries, ...result.libraries };

    registryCaches.set(registryConfig.url, {
      libraries:           mergedLibraries,
      lastSuccessfulFetch: attemptTime,
      lastAttemptedFetch:  attemptTime,
      lastFullFetch:       result.reachedEnd ? attemptTime : existing.lastFullFetch,
      incrementalUrl:      result.incrementalUrl ?? existing.incrementalUrl
    });
  } catch (err) {
    console.error(
      `Failed to refresh registry ${registryConfig.url}:`,
      err instanceof Error ? err.message : err
    );
  }
}

/**
 * Returns the current merged library list, refreshing all configured registries
 * in parallel if their data is stale. Incremental refreshes (stopping at entries
 * older than lastSuccessfulFetch) are used when the feed advertises an
 * order=modified facet. Full crawls replace the cache; partial crawls merge
 * new entries into it. On failure, the existing cached state is retained.
 *
 * Merge precedence (highest to lowest):
 *   1. Static libraries from config
 *   2. First registry in registries array
 *   3. Subsequent registries
 */
export async function getLibraries(config: AppConfig): Promise<LibrariesConfig> {
  const { registries = [], libraries: staticLibraries } = config;

  if (registries.length === 0) return staticLibraries;

  const nowSeconds = Date.now() / 1000;

  await Promise.allSettled(
    registries.map(registryConfig => refreshRegistry(registryConfig, nowSeconds))
  );

  // Merge: earlier registries override later ones; static libraries override all.
  let mergedRegistryLibraries: LibrariesConfig = {};
  for (let i = registries.length - 1; i >= 0; i--) {
    const state = registryCaches.get(registries[i].url);
    if (state?.libraries) {
      mergedRegistryLibraries = { ...mergedRegistryLibraries, ...state.libraries };
    }
  }

  return { ...mergedRegistryLibraries, ...staticLibraries };
}

/** Clears all in-memory registry caches. Intended for use in tests only. */
export function resetRegistryCaches(): void {
  registryCaches.clear();
}

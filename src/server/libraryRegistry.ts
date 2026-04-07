import type { AppConfig, LibrariesConfig, RegistryConfig } from "interfaces";
import { OPDS2 } from "interfaces";
import {
  DEFAULT_REGISTRY_REFRESH_MIN_INTERVAL,
  DEFAULT_REGISTRY_REFRESH_MAX_INTERVAL
} from "constants/registry";
import { computeSlug } from "utils/librarySlug";

interface RegistryState {
  libraries: LibrariesConfig;
  lastSuccessfulFetch: number | null; // Unix timestamp in seconds
  lastAttemptedFetch: number | null; // Unix timestamp in seconds
}

/*
 * In-memory cache mapping registry URL to its last-known state.
 * Persists across API requests within a single server instance.
 */
const registryCaches = new Map<string, RegistryState>();

/**
 * Returns true if a refresh attempt should be made for the given registry.
 *
 * A refresh is triggered when the data is stale (time since last success
 * exceeds maxInterval, or no successful fetch has occurred), provided the
 * minimum interval since the last attempt has elapsed to avoid hammering
 * failing registries.
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

  // Respect min interval between attempts regardless of staleness.
  if (state?.lastAttemptedFetch != null) {
    if (nowSeconds - state.lastAttemptedFetch < minInterval) return false;
  }

  // Refresh if we've never succeeded or the data has grown stale.
  if (!state || state.lastSuccessfulFetch == null) return true;
  return nowSeconds - state.lastSuccessfulFetch >= maxInterval;
}

/**
 * Fetches the library list from a registry URL and converts it to
 * the internal LibrariesConfig format. Throws on network or parse errors.
 */
export async function fetchRegistryLibraries(
  url: string
): Promise<LibrariesConfig> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Registry fetch failed for ${url}: ${response.status} ${response.statusText}`
    );
  }

  const feed = (await response.json()) as OPDS2.LibraryRegistryFeed;
  if (!feed.catalogs) {
    throw new Error(`Registry feed missing 'catalogs' field at: ${url}`);
  }

  return feed.catalogs.reduce<LibrariesConfig>((record, catalog) => {
    const authDocLink = catalog.links.find(
      link => link.type === OPDS2.AuthDocumentMediaType
    );
    if (!authDocLink) {
      console.warn(
        `Skipping library missing auth document link: ${catalog.metadata.title}`
      );
      return record;
    }
    const slug = computeSlug(catalog);
    return {
      ...record,
      [slug]: { title: catalog.metadata.title, authDocUrl: authDocLink.href }
    };
  }, {});
}

/**
 * Returns the current merged library list, refreshing from each configured
 * registry if the data is stale. On fetch failure, retains the most recent
 * successful state rather than falling back to build-time config.
 *
 * Merge precedence (highest to lowest):
 *   1. Static libraries from config (object `libraries`)
 *   2. First registry in `registries` array
 *   3. Subsequent registries (each has lower precedence than earlier ones)
 */
export async function getLibraries(
  config: AppConfig
): Promise<LibrariesConfig> {
  const { registries = [], libraries: staticLibraries } = config;

  // No runtime registries configured — return the build-time static libraries.
  if (registries.length === 0) {
    return staticLibraries;
  }

  const nowSeconds = Date.now() / 1000;

  for (const registryConfig of registries) {
    const state = registryCaches.get(registryConfig.url);
    if (!shouldRefresh(state, registryConfig, nowSeconds)) continue;

    const attemptTime = nowSeconds;
    const existing: RegistryState = state ?? {
      libraries: {},
      lastSuccessfulFetch: null,
      lastAttemptedFetch: null
    };

    // Record the attempt before fetching so a slow/failing request still
    // updates the timestamp and prevents tight retry loops.
    registryCaches.set(registryConfig.url, {
      ...existing,
      lastAttemptedFetch: attemptTime
    });

    try {
      const fetched = await fetchRegistryLibraries(registryConfig.url);
      registryCaches.set(registryConfig.url, {
        libraries: fetched,
        lastSuccessfulFetch: attemptTime,
        lastAttemptedFetch: attemptTime
      });
    } catch (err) {
      console.error(
        `Failed to refresh registry ${registryConfig.url}:`,
        err instanceof Error ? err.message : err
      );
      // Retain the existing cached state; lastAttemptedFetch was already updated.
    }
  }

  // Build merged registry libraries: earlier registries override later ones.
  // Iterate in reverse so each subsequent spread raises precedence.
  let mergedRegistryLibraries: LibrariesConfig = {};
  for (let i = registries.length - 1; i >= 0; i--) {
    const state = registryCaches.get(registries[i].url);
    if (state?.libraries) {
      mergedRegistryLibraries = {
        ...mergedRegistryLibraries,
        ...state.libraries
      };
    }
  }

  // Static libraries override all registry libraries.
  return { ...mergedRegistryLibraries, ...staticLibraries };
}

/** Clears all in-memory registry caches. Intended for use in tests only. */
export function resetRegistryCaches(): void {
  registryCaches.clear();
}

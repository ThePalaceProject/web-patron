/** Minimum seconds between registry fetch attempts. */
export const DEFAULT_REGISTRY_REFRESH_MIN_INTERVAL = 60;

/** Maximum seconds since last successful fetch before triggering a refresh. */
export const DEFAULT_REGISTRY_REFRESH_MAX_INTERVAL = 300;

/** Days before persisted auth credentials expire. */
export const CREDENTIAL_EXPIRATION_DAYS = 30;

/** Maximum number of previous slugs to track per library. */
export const HISTORICAL_SLUG_LIMIT = 5;

/** Items per page when fetching a crawlable registry feed. */
export const REGISTRY_CRAWLABLE_PAGE_SIZE = 100;

/**
 * Seconds between complete (all-pages) crawls of the registry.
 * Complete crawls detect library deletions that incremental crawls miss.
 * Default: 24 hours.
 */
export const DEFAULT_REGISTRY_FULL_REFRESH_INTERVAL = 86400;

/** Seconds before an individual registry page fetch is aborted. */
export const DEFAULT_REGISTRY_FETCH_TIMEOUT = 10;

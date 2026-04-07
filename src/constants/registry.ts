/** Minimum seconds between registry fetch attempts. */
export const DEFAULT_REGISTRY_REFRESH_MIN_INTERVAL = 60;

/** Maximum seconds since last successful fetch before triggering a refresh. */
export const DEFAULT_REGISTRY_REFRESH_MAX_INTERVAL = 300;

/** Days before persisted auth credentials expire. */
export const CREDENTIAL_EXPIRATION_DAYS = 30;

/** Maximum number of previous slugs to track per library. */
export const HISTORICAL_SLUG_LIMIT = 5;

/**
 * Feature flags are environment variables, following the circulation
 * manager's PALACE_<app>_FEATURE_<flag> convention. They live here rather
 * than in server/appConfig.ts so that the request proxy (src/proxy.ts) can
 * import the names without pulling in the Node-only config loader.
 */
export const OPDS2_FEATURE_FLAG_ENV = "PALACE_CPW_FEATURE_OPDS2";
export const LANGUAGE_SELECTOR_FEATURE_FLAG_ENV =
  "PALACE_CPW_FEATURE_LANGUAGE_SELECTOR";

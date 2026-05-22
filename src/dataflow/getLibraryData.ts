import { AppConfig, LibraryData, LibraryLinks, OPDS1 } from "interfaces";
import ApplicationError, { PageNotFoundError, ServerError } from "errors";
import { normalizeAuthMethods } from "utils/auth";
import { getAppConfig } from "server/appConfig";
import { getLibraries } from "server/libraryRegistry";

// ---------------------------------------------------------------------------
// Auth document cache
// ---------------------------------------------------------------------------

/*
 * Caches fetched auth documents by URL for AUTH_DOC_CACHE_TTL_SECONDS.
 * Multiple ISR route rebuilds for the same library (index, loans, book, etc.)
 * all resolve to the same auth document URL; without caching they each issue an
 * independent upstream fetch in quick succession. The cache prevents that burst
 * and also limits load on auth document servers during high-traffic periods.
 *
 * pendingAuthDocFetches coalesces concurrent requests for the same URL so that
 * exactly one in-flight fetch exists at a time, matching the pattern used by
 * libraryRegistry.ts for registry crawls.
 *
 * Stored on `global` for the same reason as libraryRegistry.ts: Next.js bundles
 * each route independently, so module-level Maps would not be shared across
 * bundle contexts in the same process.
 */
interface AuthDocCacheEntry {
  doc: OPDS1.AuthDocument;
  fetchedAt: number;
}

interface AuthDocModuleState {
  authDocCache: Map<string, AuthDocCacheEntry>;
  pendingAuthDocFetches: Map<string, Promise<OPDS1.AuthDocument>>;
}

declare const global: typeof globalThis & {
  __cpwAuthDocState?: AuthDocModuleState;
};

if (!global.__cpwAuthDocState) {
  global.__cpwAuthDocState = {
    authDocCache: new Map<string, AuthDocCacheEntry>(),
    pendingAuthDocFetches: new Map<string, Promise<OPDS1.AuthDocument>>()
  };
}

const { authDocCache, pendingAuthDocFetches } = global.__cpwAuthDocState;
const AUTH_DOC_CACHE_TTL_SECONDS = 3600;

/** Clears the auth document cache. Intended for use in tests only. */
export function resetAuthDocCache(): void {
  authDocCache.clear();
  pendingAuthDocFetches.clear();
}

/**
 * Interprets the app config to return the auth document url.
 * Uses getLibraries so registry-sourced libraries (not present in the static
 * build-time config) are included in the lookup.
 *
 * Accepts an already-fetched AppConfig to avoid a redundant getAppConfig()
 * call when the caller has already loaded it.
 */
export async function getAuthDocUrl(
  librarySlug: string,
  appConfig?: AppConfig
): Promise<string> {
  const config = appConfig ?? (await getAppConfig());
  const libraries = await getLibraries(config);

  const authDocUrl =
    librarySlug in libraries ? libraries[librarySlug]?.authDocUrl : undefined;
  if (typeof authDocUrl !== "string") {
    throw new PageNotFoundError(
      `No authentication document url is configured for the library: ${librarySlug}.`
    );
  }
  return authDocUrl;
}

/**
 * Fetches an auth document from the supplied url and returns it as a parsed
 * AuthDocument. Results are cached for AUTH_DOC_CACHE_TTL_SECONDS; concurrent
 * requests for the same URL share a single in-flight fetch.
 */
export async function fetchAuthDocument(
  url: string
): Promise<OPDS1.AuthDocument> {
  const now = Date.now() / 1000;

  const cached = authDocCache.get(url);
  if (cached && now - cached.fetchedAt < AUTH_DOC_CACHE_TTL_SECONDS) {
    return cached.doc;
  }

  const pending = pendingAuthDocFetches.get(url);
  if (pending) return pending;

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const details = await response.json();
        throw new ServerError(url, response.status, details);
      }
      const doc: OPDS1.AuthDocument = await response.json();
      authDocCache.set(url, { doc, fetchedAt: Date.now() / 1000 });
      return doc;
    } finally {
      pendingAuthDocFetches.delete(url);
    }
  })();

  pendingAuthDocFetches.set(url, fetchPromise);
  return fetchPromise;
}

/**
 * Extracts the loans url from an auth document
 */
function getShelfUrl(authDoc: OPDS1.AuthDocument): string | null {
  return (
    authDoc.links?.find(link => {
      return link.rel === OPDS1.ShelfLinkRel;
    })?.href ?? null
  );
}

/**
 * Extracts the user profile url from an auth document
 */
function getUserProfileUrl(authDoc: OPDS1.AuthDocument): string | null {
  return (
    authDoc.links?.find(link => {
      return link.rel === OPDS1.UserProfileLinkRel;
    })?.href ?? null
  );
}

/**
 * Extracts the catalog root url from an auth document
 */
function getCatalogUrl(authDoc: OPDS1.AuthDocument): string {
  const url: string | undefined = authDoc.links?.find(
    link => link.rel === OPDS1.CatalogRootRel
  )?.href;

  if (!url) {
    const selfUrl =
      authDoc.links?.find(link => link.rel === OPDS1.SelfRel)?.href ??
      "(unknown: missing auth doc 'self' link or href)";
    throw new ApplicationError({
      detail: `No Catalog Root URL present in Auth Document at ${selfUrl}.`
    });
  }

  return url;
}
/**
 * Constructs the internal LibraryData state from an auth document,
 * catalog url, and library slug.
 */
export function buildLibraryData(
  authDoc: OPDS1.AuthDocument,
  librarySlug: string
): LibraryData {
  const logoUrl = authDoc.links?.find(link => link.rel === "logo")?.href;
  const headerLinks =
    authDoc.links?.filter(link => link.rel === "navigation") ?? [];
  const libraryLinks = parseLinks(authDoc.links);
  const authMethods = normalizeAuthMethods(authDoc);
  const shelfUrl = getShelfUrl(authDoc);
  const userProfileUrl = getUserProfileUrl(authDoc);
  const catalogUrl = getCatalogUrl(authDoc);
  return {
    slug: librarySlug,
    catalogUrl,
    shelfUrl: shelfUrl ?? null,
    userProfileUrl: userProfileUrl,
    catalogName: authDoc.title,
    logoUrl: logoUrl ?? null,
    colors:
      authDoc.web_color_scheme?.primary && authDoc.web_color_scheme.secondary
        ? {
            primary: authDoc.web_color_scheme.primary,
            secondary: authDoc.web_color_scheme.secondary
          }
        : null,
    headerLinks,
    libraryLinks,
    authMethods
  };
}

/**
 * Parses the links array in an auth document into an object of links.
 */
function parseLinks(links: OPDS1.AuthDocumentLink[] | undefined): LibraryLinks {
  if (!links) return {};
  const parsed = links.reduce((links, link) => {
    switch (link.rel) {
      case "about":
        return { ...links, about: link };
      case "alternate":
        return { ...links, libraryWebsite: link };
      case "privacy-policy":
        return { ...links, privacyPolicy: link };
      case "terms-of-service":
        return { ...links, tos: link };
      case "help":
        if (link.type === OPDS1.HTMLMediaType)
          return { ...links, helpWebsite: link };
        return { ...links, helpEmail: link };
      case "register":
      case "logo":
      case "navigation":
        return links;
      default:
        return links;
    }
  }, {});
  return parsed;
}

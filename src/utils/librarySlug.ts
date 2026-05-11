import { OPDS2 } from "interfaces";

/**
 * Returns `true` if slug is considered valid.
 *
 * TODO: Consider adding more stringent validation rules. For example:
 *  - RFC 3986 unreserved characters
 */
export function validateSlug(slug: string): boolean {
  return slug.length > 0;
}

function firstPathComponent(href: string): string | null {
  try {
    const parts = new URL(href).pathname.split("/").filter(p => p.length > 0);
    const raw = parts[0];
    if (!raw) return null;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  } catch {
    return null;
  }
}

/**
 * Heuristically derives a short name for a library from its registry catalog
 * entry by extracting the first path component of the catalog root link, or
 * the authentication document link when the catalog link yields no path
 * component. Returns null when neither link yields a path component.
 */
export function getRegistryLibraryShortName(
  catalogEntry: OPDS2.CatalogEntry
): string | null {
  const catalogLink = catalogEntry.links.find(
    l => l.rel === OPDS2.CatalogRootRelation
  );
  if (catalogLink) {
    const component = firstPathComponent(catalogLink.href);
    if (component) return component;
  }

  // TODO: Match only on l.rel === OPDS2.AuthDocumentRelation once the registry
  // consistently includes a rel attribute on authentication document links.
  const authDocLink = catalogEntry.links.find(
    l =>
      l.rel === OPDS2.AuthDocumentRelation ||
      l.type === OPDS2.AuthDocumentMediaType
  );
  if (authDocLink) {
    const component = firstPathComponent(authDocLink.href);
    if (component) return component;
  }

  return null;
}

/**
 * Computes the URL slug for a library from its registry catalog entry.
 * The slug is used in URL paths (`/[slug]/`).
 *
 * Prefers the library short name derived from link URLs, then falls back
 * to the library's registry identifier.
 */
export function computeSlug(catalogEntry: OPDS2.CatalogEntry): string {
  return getRegistryLibraryShortName(catalogEntry) ?? catalogEntry.metadata.id;
}

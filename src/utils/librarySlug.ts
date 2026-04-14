import type { OPDS2 } from "interfaces";

/**
 * Returns `true` if slug is considered valid.
 *
 * TODO: Consider adding more stringent validation rules. For example:
 *  - RFC 3986 unreserved characters
 */
export function validateSlug(slug: string): boolean {
  return slug.length > 0;
}

/**
 * Computes the URL slug for a library from its registry catalog entry.
 * The slug is used in URL paths (`/[slug]/`).
 *
 * Currently, the slug is simply the library's registry ID.'
 */
export function computeSlug(catalogEntry: OPDS2.CatalogEntry): string {
  return catalogEntry.metadata.id;
}

import type { OPDS2 } from "interfaces";

/**
 * Returns true if slug can appear as a URL path segment without percent-encoding.
 */
export function validateSlug(slug: string): boolean {
  return slug.length > 0 && encodeURIComponent(slug) === slug;
}

/**
 * Computes the URL slug for a library from its registry catalog entry.
 * The slug is used in URL paths (`/[slug]/`).
 *
 * URN identifiers (e.g. "urn:uuid:3f0b05a0-...") are normalized by stripping
 * the "urn:" prefix and replacing any remaining colons with dashes.
 */
export function computeSlug(catalogEntry: OPDS2.CatalogEntry): string {
  let slug = catalogEntry.metadata.id;
  if (slug.startsWith("urn:")) {
    slug = slug.slice(4).replace(/:/g, "-");
  }
  return slug;
}

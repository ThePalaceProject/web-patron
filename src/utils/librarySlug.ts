import type { OPDS2 } from "interfaces";

/**
 * Computes the URL slug for a library from its registry catalog entry.
 * The slug is used in URL paths (`/[slug]/`).
 */
export function computeSlug(catalogEntry: OPDS2.CatalogEntry): string {
  return catalogEntry.metadata.id;
}

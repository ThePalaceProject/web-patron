/* eslint-disable camelcase */

/**
 * ArkType runtime schemas for Library Registry OPDS 2.0 feed responses.
 *
 * These schemas are aligned with what the Palace Library Registry
 * (`library-registry` repo, `palace.registry.opds.OPDSCatalog`) produces.
 * Both the full feed and crawlable (paginated) feed share the same shape;
 * the single-library endpoint (`/libraries/<uuid>`) also uses it (with
 * a single catalog entry).
 *
 * The derived TypeScript types are re-exported from types/opds2.ts so
 * the rest of the codebase can continue to import from the OPDS2 namespace.
 */

import { type } from "arktype";

// -- Links ------------------------------------------------------------------

// Matches the dict-style links emitted by OPDSCatalog.add_link_to_catalog.
// Links may carry a `properties` dict (used for facet metadata and hyperlink
// validation status).
export const LinkSchema = type({
  href: "string",
  "type?": "string",
  "rel?": "string",
  "title?": "string",
  "properties?": "Record<string, unknown>"
});

// -- Catalog entries --------------------------------------------------------

// Matches OPDSCatalog.library_catalog metadata output.
// The registry emits both `modified` and `updated` (identical values) for
// backwards compatibility.
export const CatalogEntryMetadataSchema = type({
  id: "string",
  title: "string",
  updated: "string",
  modified: "string",
  "description?": "string"
});

export const CatalogEntrySchema = type({
  metadata: CatalogEntryMetadataSchema,
  links: LinkSchema.array(),
  "images?": LinkSchema.array()
});

// -- Facets -----------------------------------------------------------------

// Matches the facet groups emitted by OPDSCatalog._add_facets.
// Metadata carries `title` and an optional `@type` URI identifying the
// facet dimension (sort, availability, etc.).
export const FacetGroupMetadataSchema = type({
  title: "string",
  '"@type"?': "string"
});

export const FacetGroupSchema = type({
  metadata: FacetGroupMetadataSchema,
  links: LinkSchema.array()
});

// -- Feed -------------------------------------------------------------------

// Matches the top-level OPDSCatalog output.
// Paginated feeds add `numberOfItems` to metadata.
// `adobe_vendor_id` is a sitewide setting from the registry's
// ExternalIntegration table, always present but null when no Adobe
// Vendor ID integration is configured.
export const FeedMetadataSchema = type({
  title: "string",
  "adobe_vendor_id?": "string | null",
  "numberOfItems?": "number"
});

export const RegistryFeedSchema = type({
  metadata: FeedMetadataSchema,
  links: LinkSchema.array(),
  "catalogs?": CatalogEntrySchema.array(),
  "facets?": FacetGroupSchema.array()
});

// -- Derived types ----------------------------------------------------------

export type RegistryLink = typeof LinkSchema.infer;
export type CatalogEntryMetadata = typeof CatalogEntryMetadataSchema.infer;
export type CatalogEntry = typeof CatalogEntrySchema.infer;
export type FacetGroupMetadata = typeof FacetGroupMetadataSchema.infer;
export type FacetGroup = typeof FacetGroupSchema.infer;
export type FeedMetadata = typeof FeedMetadataSchema.infer;
export type RegistryFeed = typeof RegistryFeedSchema.infer;

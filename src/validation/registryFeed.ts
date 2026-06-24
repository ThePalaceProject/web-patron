import { type } from "arktype";

const LinkSchema = type({
  href: "string",
  "type?": "string",
  "rel?": "string"
});

const CatalogEntryMetadataSchema = type({
  id: "string",
  title: "string",
  updated: "string",
  "description?": "string"
});

const CatalogEntrySchema = type({
  metadata: CatalogEntryMetadataSchema,
  links: LinkSchema.array()
});

const FacetGroupSchema = type({
  metadata: type({ title: "string" }),
  links: LinkSchema.array()
});

export const RegistryFeedSchema = type({
  metadata: type({ title: "string" }),
  links: LinkSchema.array(),
  "catalogs?": CatalogEntrySchema.array(),
  "facets?": FacetGroupSchema.array()
});

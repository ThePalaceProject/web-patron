/* eslint-disable camelcase */
import { OPDS1 } from "interfaces";

/**
 * OPDS 2.0 DATA TYPES
 *
 * Library Registry types are derived from the ArkType schemas in
 * validation/registryFeed.ts (aligned with what the Palace Library Registry
 * actually produces). Generic OPDS 2 structural types (Collection, Feed, etc.)
 * remain hand-written.
 */

// Schema-derived types for registry feed validation.
export type {
  CatalogEntry,
  CatalogEntryMetadata,
  FacetGroup,
  FacetGroupMetadata,
  FeedMetadata,
  RegistryFeed as LibraryRegistryFeed
} from "validation/registryFeed";

export interface Collection<M extends AnyObject = AnyObject> {
  metadata: M;
  links: Link[];
}

export interface Feed<M extends AnyObject = AnyObject> extends Collection<M> {
  navigation?: NavigationLink[];
  publications?: Publication[];
  groups?: Group[];
}
export interface NavigationLink extends Link {
  title: string;
}

type GroupMetadata = { title: string };
export interface Group extends Collection<GroupMetadata> {
  groups: Feed<GroupMetadata>[];
}

/** URI identifying the sort facet group in a Library Registry feed. */
export const SortFacetType = "http://palaceproject.io/terms/rel/sort";

/** URI identifying the availability facet group in a Library Registry feed. */
export const AvailabilityFacetType =
  "http://palaceproject.io/terms/rel/availability";

/** Property key marking a facet link as the default option for its group. */
export const FacetDefaultProperty =
  "http://palaceproject.io/terms/properties/default";

/** Facet link property: the query parameter value for this facet. */
export const FacetValueProperty = "http://palaceproject.io/terms/facet/value";

/** Facet group property: the query parameter name this group controls. */
export const FacetParamProperty = "http://palaceproject.io/terms/facet/param";

/** Facet link property: logical group linking related sort variants. */
export const FacetGroupProperty = "http://palaceproject.io/terms/facet/group";

export type Publication = ReadiumWebPub | OPDSPublication;

export interface ReadiumWebPub extends Collection {
  readingOrder: any[];
}
export interface OPDSPublication extends Collection {}

/**
 * Links
 */
export const AuthDocumentRelation = "http://opds-spec.org/auth/document";
export const CatalogLinkTemplateRelation =
  "http://librarysimplified.org/rel/registry/library";
export const CatalogRootRelation = "http://opds-spec.org/catalog";

export const PaginationNextRelation = "next";
export const PaginationFirstRelation = "first";
export const PaginationPrevRelation = "previous";
export const PaginationLastRelation = "last";

export type PaginationLinkRelation =
  | typeof PaginationNextRelation
  | typeof PaginationFirstRelation
  | typeof PaginationPrevRelation
  | typeof PaginationLastRelation;

export type AnyLinkRelation =
  | typeof CatalogLinkTemplateRelation
  | typeof CatalogRootRelation
  | typeof AuthDocumentRelation
  | PaginationLinkRelation
  | "self"
  | "search"
  | "registry";

export const BaseDocumentMediaType = "application/opds+json";
export const AuthDocumentMediaType =
  "application/vnd.opds.authentication.v1.0+json";

export type AnyMediaType =
  | typeof BaseDocumentMediaType
  | typeof AuthDocumentMediaType
  | typeof OPDS1.BaseDocumentMediaType
  | "application/opensearchdescription+xml"
  | "application/opds+json;profile=https://librarysimplified.org/rel/profile/directory";

export interface Link<
  R extends string = AnyLinkRelation,
  T extends string = AnyMediaType
> {
  href: string;
  type: T;
  rel: R;
}

export interface CatalogTemplateLink extends Link<
  typeof CatalogLinkTemplateRelation,
  typeof BaseDocumentMediaType
> {
  templated: true;
}

export interface AuthDocumentLink extends Link<
  typeof AuthDocumentRelation,
  typeof AuthDocumentMediaType
> {}
export interface CatalogRootFeedLink extends Link<
  typeof CatalogRootRelation,
  typeof OPDS1.BaseDocumentMediaType
> {}

/**
 * URI template variable extension (Palace Project).
 * Maps template variable names to well-known term URIs so clients can resolve
 * variable values by semantic type rather than by variable name.
 */
export interface UriTemplateVariable {
  term: string;
  required?: boolean;
}

export interface UriTemplateVariableMap {
  "@type"?: string;
  map: Record<string, UriTemplateVariable>;
}

export interface UriTemplateProperties {
  uri_template_variables?: UriTemplateVariableMap;
}

/**
 * Utility types
 */
export type AnyObject = Record<string, unknown>;

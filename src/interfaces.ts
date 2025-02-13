/* eslint-disable camelcase */

/**
 * OPDS 2.0 DATA TYPES
 * Currently only used for support of a Library Registry, which is
 * an OPDS 2 Feed of OPDS 2 Catalogs from which we extract the catalog root url
 */
export * as OPDS2 from "types/opds2";
/**
 * OPDS 1.x DATA TYPES
 */
import * as OPDS1 from "types/opds1";
export { OPDS1 };

/**
 * INTERNAL APP MODEL
 */

export type AppConfig = {
  instanceName: string;
  mediaSupport: MediaSupportConfig;
  libraries: LibrariesConfig;
  companionApp: "simplye" | "openebooks";
  showMedium: boolean;
  gtmId: string | null;
  bugsnagApiKey: string | null;
  openebooks: OpenEbooksConfig | null;
};

export type OpenEbooksConfig = {
  defaultLibrary: string;
};

export type MediaSupportConfig = DirectMediaSupport & IndirectMediaSupport;
export type DirectMediaSupport = Partial<
  Record<OPDS1.AnyBookMediaType, MediaSupportLevel>
>;
export type IndirectMediaSupport = Partial<
  Record<OPDS1.IndirectAcquisitionType, DirectMediaSupport>
>;

export type MediaSupportLevel =
  | "show"
  | "redirect"
  | "redirect-and-show"
  | "unsupported";

export type LibraryRegistryBase = string;
export type LibrariesConfig = Record<
  string,
  { title: string; authDocUrl: string } | undefined
>;

export interface ComplaintData {
  type: string;
  detail?: string;
}

export type LibraryLinks = {
  helpWebsite?: OPDS1.Link;
  helpEmail?: OPDS1.Link;
  libraryWebsite?: OPDS1.Link;
  tos?: OPDS1.Link;
  about?: OPDS1.Link;
  privacyPolicy?: OPDS1.Link;
  registration?: OPDS1.Link;
};

/**
 * The server representation has multiple IDPs nested into the one.
 * We will flatten that out before placing into LibraryData.
 */
export interface ClientSamlMethod
  extends OPDS1.AuthMethod<typeof OPDS1.SamlAuthType> {
  href: string;
  id: string;
}
export interface ClientCleverMethod extends OPDS1.CleverAuthMethod {
  id: string;
}
export interface ClientBasicMethod extends OPDS1.BasicAuthMethod {
  id: string;
}

// auth methods once they have been processed for the app
export type AppAuthMethod =
  | ClientCleverMethod
  | ClientBasicMethod
  | ClientSamlMethod;

export interface AuthCredentials {
  methodType: AppAuthMethod["type"];
  token: string;
}

export interface LibraryData {
  slug: string;
  catalogUrl: string;
  catalogName: string;
  logoUrl: string | null;
  colors: {
    primary: string;
    secondary: string;
  } | null;
  headerLinks: OPDS1.Link[];
  libraryLinks: LibraryLinks;
  authMethods: AppAuthMethod[];
  shelfUrl: string | null;
}

/**
 * INTERNAL BOOK MODEL
 */

export type FulfillmentLink = {
  contentType: OPDS1.AnyBookMediaType;
  url: string;
  indirectionType?: OPDS1.IndirectAcquisitionType;
  supportLevel: MediaSupportLevel;
};

export type BookMedium =
  | "http://bib.schema.org/Audiobook"
  | "http://schema.org/EBook"
  | "http://schema.org/Book";

export type BookAvailability =
  | "available"
  | "unavailable"
  | "reserved"
  | "ready";

export type Book<Status = EmptyObject> = Readonly<
  Status & {
    id: string;
    title: string;
    series?: {
      name: string;
      position?: number;
    } | null;
    authors?: string[];
    contributors?: string[];
    subtitle?: string;
    summary?: string;
    imageUrl?: string;
    availability?: {
      status: BookAvailability;
      since?: string;
      until?: string;
    };
    holds?: {
      total: number;
      position?: number;
    } | null;
    copies?: {
      total: number;
      available: number;
    } | null;
    url: string;
    publisher?: string;
    published?: string;
    categories?: string[];
    providerName?: string;
    language?: string;
    relatedUrl: string | null;
    raw?: any;
    trackOpenBookUrl: string | null;
  }
>;

export type BorrowableBook = Book<{
  status: "borrowable";
  borrowUrl: string;
}>;

export type OnHoldBook = Book<{
  status: "on-hold";
  borrowUrl: string;
}>;

export type ReservableBook = Book<{
  status: "reservable";
  reserveUrl: string;
}>;

export type ReservedBook = Book<{
  status: "reserved";
  revokeUrl: string | null;
}>;

export type FulfillableBook = Book<{
  status: "fulfillable";
  fulfillmentLinks: readonly FulfillmentLink[];
  revokeUrl: string | null;
}>;

export type UnsupportedBook = Book<{
  status: "unsupported";
}>;

export type AnyBook =
  | BorrowableBook
  | OnHoldBook
  | ReservableBook
  | ReservedBook
  | FulfillableBook
  | UnsupportedBook;

/**
 * INTERNAL COLLECTION MODEL
 */
export interface LaneData {
  title: string;
  url: string;
  books: AnyBook[];
}

export interface FacetData {
  label: string;
  href: string;
  active: boolean;
}

export interface FacetGroupData {
  label: string;
  facets: FacetData[];
}

export interface CollectionData {
  id: string;
  url: string;
  title: string;
  lanes: LaneData[];
  books: AnyBook[];
  navigationLinks: LinkData[];
  facetGroups?: FacetGroupData[];
  nextPageUrl?: string;
  catalogRootLink?: LinkData | null;
  parentLink?: LinkData | null;
  shelfUrl?: string;
  links?: LinkData[] | null;
  searchDataUrl: string | null;
  raw?: any;
}

export interface SearchData {
  url: string;
  description: string;
  shortName: string;
  template: string;
}

export interface LinkData {
  text?: string;
  url: string;
  id?: string | null;
  type?: string;
}

/**
 * Xml2js
 */
interface XMLAttribute {
  local?: string;
  name?: string;
  prefix?: string;
  uri?: string;
  value?: string;
}

interface XMLNamespace {
  uri?: string;
  local?: string;
}

export interface XMLTagWithAttributes {
  $?: XMLAttribute;
  $ns?: XMLNamespace;
}

/**
 * Complaints
 */

export type { ComplaintsState } from "./hooks/useComplaints/reducer";

/**
 * Theme
 */
export type { AppTheme } from "theme";
// helper for theme variant prop types
export type VariantProp<VType> = Exclude<
  keyof VType,
  keyof Record<string, unknown>
>;

/**
 * Utils
 */

type PickAndRequire<T, K extends keyof T> = { [P in K]-?: NonNullable<T[P]> };

/** Utility to make certain keys of a type required */
export type RequiredKeys<T, K extends keyof T> = Omit<T, K> &
  PickAndRequire<T, K>;

export type NextLinkConfig = {
  href: string;
  as?: string;
};

export type EmptyObject = Record<never, unknown>;

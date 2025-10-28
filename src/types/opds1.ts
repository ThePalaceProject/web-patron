/* eslint-disable camelcase */

/**
 * Typings for OPDS 1.2. This is a working document and it
 * is not complete. It currently focuses on typing of links
 * and the AuthDocument. The Feed and Entry are pretty well
 * typed by opds-feed-parser.
 */

/**
 * Link Relations
 */
export const SelfRel = "self";
export const AuthDocLinkRelation = "http://opds-spec.org/auth/document";
export const AcquisitionLinkRel = "http://opds-spec.org/acquisition";
export const BorrowLinkRel = "http://opds-spec.org/acquisition/borrow";
export const RevokeLinkRel = "http://librarysimplified.org/terms/rel/revoke";
export const TrackOpenBookRel =
  "http://librarysimplified.org/terms/rel/analytics/open-book";
export type AnyLinkRelation =
  | typeof SelfRel
  | typeof AuthDocLinkRelation
  | typeof AcquisitionLinkRel
  | typeof BorrowLinkRel
  | typeof RevokeLinkRel
  | typeof TrackOpenBookRel
  | AuthDocLinkRelations
  | "related";

/**
 * Link Roles
 */

export type AnyLinkRole = string;

/**
 * Media Types
 */

export const BaseDocumentMediaType =
  "application/atom+xml;profile=opds-catalog;kind=acquisition";
export const HTMLMediaType = "text/html";
export const AuthDocMediaType = "application/opds-authentication+json";

/**
 * Indirect Acquisition Types
 */

/**
 * This type indicates that you must fetch the associated href, which will
 * return an OPDS entry that will contain a direct link for the next type
 * in the chain.
 */
export const OPDSEntryMediaType =
  "application/atom+xml;type=entry;profile=opds-catalog";
/**
 * This means the content is encrypted with Adobe DRM. These files can't be
 * decrypted by us, so just download them and let the user open it in an app
 * that can deal with it.
 */
export const AdobeDrmMediaType = "application/vnd.adobe.adept+xml";
// there was an issue with incorrect Adept media types being sent.
export const IncorrectAdobeDrmMediaType = "vnd.adobe/adept+xml";
// this is not yet supported, but the description is here:
// https://github.com/NYPL-Simplified/Simplified/wiki/OPDSForDistributors#bearer-token-propagation
export const BearerTokenMediaType =
  "application/vnd.librarysimplified.bearer-token+json";

export type IndirectAcquisitionType =
  | typeof OPDSEntryMediaType
  | typeof AdobeDrmMediaType
  | typeof BearerTokenMediaType;

/**
 * Direct Acquisition Types
 * These are the final types that resources can be.
 */
export const EpubMediaType = "application/epub+zip";
export const KepubMediaType = "application/kepub+zip";
export const PdfMediaType = "application/pdf";
export const AudioMpegMediaType = "audio/mpeg";
export const MobiPocketMediaType = "application/x-mobipocket-ebook";
export const Mobi8Mediatype = "application/x-mobi8-ebook";
export const AudiobookMediaType = "application/audiobook+json";
export const LcpAudioBookMediaType = "application/audiobook+lcp";
export const ExternalReaderMediaType =
  'text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"';
export const OverdriveAudiobookMediaType =
  "application/vnd.overdrive.circulation.api+json;profile=audiobook";
export const OverdriveEbookMediaType =
  "application/vnd.overdrive.circulation.api+json;profile=ebook";
export const AxisNowWebpubMediaType =
  "application/vnd.librarysimplified.axisnow+json";
export const AccessRestrictionAudiobookMediaType =
  'application/audiobook+json;profile="http://www.feedbooks.com/audiobooks/access-restriction"';
export const FindawayAudiobookMediaType =
  "application/vnd.librarysimplified.findaway.license+json";

export const EPUB_MEDIA_TYPES = [
  AxisNowWebpubMediaType,
  EpubMediaType,
  KepubMediaType
];

export type ReadOnlineMediaType =
  | typeof ExternalReaderMediaType
  | typeof AxisNowWebpubMediaType
  | typeof OverdriveEbookMediaType;

export type EpubFormatType = (typeof EPUB_MEDIA_TYPES)[number];

export type PdfFormatType = typeof PdfMediaType;

export type BookFormatType =
  | ReadOnlineMediaType
  | EpubFormatType
  | PdfFormatType;

export type DownloadMediaType =
  | typeof EpubMediaType
  | typeof KepubMediaType
  | typeof PdfMediaType
  | typeof MobiPocketMediaType
  | typeof Mobi8Mediatype;

export type UnsupportedMediaType =
  | typeof AccessRestrictionAudiobookMediaType
  | typeof AudiobookMediaType
  | typeof OverdriveAudiobookMediaType
  | typeof FindawayAudiobookMediaType;

export type AnyBookMediaType =
  | ReadOnlineMediaType
  | DownloadMediaType
  | UnsupportedMediaType;

export type AnyMediaType =
  | AnyBookMediaType
  | typeof HTMLMediaType
  | typeof BaseDocumentMediaType
  | typeof AuthDocMediaType;

export interface Link {
  href: string;
  rel?: AnyLinkRelation;
  title?: string;
  type?: AnyMediaType;
  role?: AnyLinkRole;
}

/**
 * Auth Document
 */
export const CatalogRootRel = "start";
export const ShelfLinkRel = "http://opds-spec.org/shelf";
type AuthDocLinkRelations =
  | typeof SelfRel
  | typeof CatalogRootRel
  | typeof ShelfLinkRel
  | "navigation"
  | "logo"
  | "register"
  | "help"
  | "privacy-policy"
  | "terms-of-service"
  | "about"
  | "alternate"
  | "authenticate";

export interface AuthDocumentLink extends Link {
  rel: AuthDocLinkRelations;
}

export const BasicAuthType = "http://opds-spec.org/auth/basic";
export const BasicTokenAuthType =
  "http://thepalaceproject.org/authtype/basic-token";
export const SamlAuthType = "http://librarysimplified.org/authtype/SAML-2.0";
export const CleverAuthType =
  "http://librarysimplified.org/authtype/OAuth-with-intermediary";
export const ImplicitGrantAuthType = "http://opds-spec.org/auth/oauth/implicit";
export const PasswordCredentialsAuthType =
  "http://opds-spec.org/auth/oauth/password";

export type AnyAuthType =
  | typeof BasicAuthType
  | typeof BasicTokenAuthType
  | typeof SamlAuthType
  | typeof CleverAuthType
  | typeof ImplicitGrantAuthType
  | typeof PasswordCredentialsAuthType;

// https://drafts.opds.io/authentication-for-opds-1.0
export interface AuthMethod<T extends AnyAuthType, L extends Link = Link> {
  type: T;
  description?: string;
  // https://drafts.opds.io/authentication-for-opds-1.0#312-links
  links?: L[];
}
export interface ServerSamlMethod
  extends AuthMethod<typeof SamlAuthType, SamlIdp> {}

export interface CleverAuthMethod extends AuthMethod<typeof CleverAuthType> {}

export interface BasicAuthMethod extends AuthMethod<typeof BasicAuthType> {
  inputs?: {
    login?: AuthInput;
    password?: AuthInput;
  };

  labels: {
    login: string;
    password: string;
  };
}

// TODO: This may need adjustment when we actually implement BasicTokenAuth.
//  In the mean time, we'll borrow some properties from BasicAuthMethod.
export interface BasicTokenAuthMethod
  extends Omit<BasicAuthMethod, "type">,
    AuthMethod<typeof BasicTokenAuthType> {}

export interface AuthInput {
  keyboard?: Keyboard;
}

export enum Keyboard {
  Default = "Default",
  NoInput = "No input",
  NumberPad = "Number pad",
  EmailAddress = "Email address"
}

export type ServerAuthMethod =
  | CleverAuthMethod
  | BasicAuthMethod
  | BasicTokenAuthMethod
  | ServerSamlMethod;

export interface Announcement {
  id: string;
  content: string;
}

export interface AuthDocument {
  id: string;
  title: string;
  // used to display text prompt to authenticating user
  description?: string;
  links?: AuthDocumentLink[];
  authentication: ServerAuthMethod[];
  announcements?: Announcement[];
  web_color_scheme?: {
    primary?: string;
    secondary?: string;
  };
}

/**
 * Bearer token propagation document
 * See: https://github.com/NYPL-Simplified/Simplified/wiki/OPDSForDistributors#how-it-works
 */

export interface BearerTokenDocument {
  expires_in: string;
  token_type: string;
  access_token: string;
  location: string;
}

/**
 * SAML is an extension on the OPDS1 spec which only
 * works when backed by a Circulation Manager
 */
export type SamlIdp = {
  privacy_statement_urls: [];
  logo_urls: [];
  display_names: [
    {
      language: string;
      value: string;
    }
  ];
  href: string;
  descriptions: [
    {
      language: string;
      value: string;
    }
  ];
  rel: "authenticate";
  information_urls: [];
};

/**
 * Circ Manager
 */
export type ProblemDocument = {
  detail: string;
  title: string;
  type?: string;
  status?: number;
};

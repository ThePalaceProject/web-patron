/* eslint-disable camelcase */

/**
 * ArkType runtime schemas for the Palace Manager authentication document.
 *
 * These schemas mirror the Pydantic models in the Palace Manager
 * (`palace-opds` package, `palace.opds.authentication` module):
 *
 *   PalaceAuthenticationDocument  →  AuthDocumentSchema
 *   PalaceAuthentication          →  AuthenticationSchema
 *   AuthenticationLabels          →  AuthenticationLabelsSchema
 *   AuthenticationInput           →  AuthenticationInputSchema
 *   AuthenticationInputs          →  AuthenticationInputsSchema
 *   AuthenticateLink / BaseLink   →  LinkSchema / AuthenticateLinkSchema
 *   LocalizedValue                →  LocalizedValueSchema
 *   AnnouncementDocument          →  AnnouncementSchema
 *   WebColorScheme                →  WebColorSchemeSchema
 *   Features                      →  FeaturesSchema
 *   PublicKey                     →  PublicKeySchema
 *
 * The derived TypeScript types are re-exported from types/opds1.ts so the
 * rest of the codebase can continue to import them from the OPDS1 namespace.
 */

import { type } from "arktype";

// -- Links ------------------------------------------------------------------

// Matches PM's BaseLink.
// TODO: PM allows `rel` to be `string | string[]`. CPW currently
//  uses `rel` with strict equality, so accepting arrays here would
//  pass validation but silently break downstream matching.
//  Update all `rel` uses to handle both forms before widening this.
export const LinkSchema = type({
  href: "string",
  "rel?": "string",
  "templated?": "boolean",
  "type?": "string",
  "title?": "string",
  "role?": "string"
});

// Matches PM's palace.LocalizedValue.
export const LocalizedValueSchema = type({
  value: "string",
  "language?": "string",
  "height?": "number",
  "width?": "number"
});

// Matches PM's AuthenticateLink (Link + Palace localized extensions).
// Used for SAML IdP and OIDC authenticate/logout links.
export const AuthenticateLinkSchema = type({
  href: "string",
  "rel?": "string",
  "templated?": "boolean",
  "type?": "string",
  "title?": "string",
  "display_names?": LocalizedValueSchema.array(),
  "descriptions?": LocalizedValueSchema.array(),
  "information_urls?": LocalizedValueSchema.array(),
  "privacy_statement_urls?": LocalizedValueSchema.array(),
  "logo_urls?": LocalizedValueSchema.array(),
  "properties?": type({
    "uri_template_variables?": type({
      '"@type"?': "string",
      map: "Record<string, unknown>"
    })
  })
});

// -- Authentication methods -------------------------------------------------

// Matches PM's AuthenticationLabels.
export const AuthenticationLabelsSchema = type({
  login: "string",
  password: "string"
});

// Matches PM's AuthenticationInput.
export const AuthenticationInputSchema = type({
  "keyboard?": "string",
  "maximum_length?": "number",
  "barcode_format?": "string"
});

// Matches PM's AuthenticationInputs.
export const AuthenticationInputsSchema = type({
  login: AuthenticationInputSchema,
  password: AuthenticationInputSchema
});

// Matches PM's PalaceAuthentication (Authentication + AuthenticationExtension).
export const AuthenticationSchema = type({
  type: "string",
  "description?": "string",
  "labels?": AuthenticationLabelsSchema,
  "inputs?": AuthenticationInputsSchema,
  "links?": LinkSchema.array()
});

// -- Document-level fields --------------------------------------------------

// Matches PM's AnnouncementDocument.
export const AnnouncementSchema = type({
  id: "string",
  content: "string"
});

// Matches PM's WebColorScheme.
export const WebColorSchemeSchema = type({
  "primary?": "string",
  "secondary?": "string",
  "background?": "string",
  "foreground?": "string"
});

// Matches PM's Features.
export const FeaturesSchema = type({
  "enabled?": "string[]",
  "disabled?": "string[]"
});

// Matches PM's PublicKey.
export const PublicKeySchema = type({
  "type?": "string",
  value: "string"
});

// -- Authentication document ------------------------------------------------

// Matches PM's PalaceAuthenticationDocument.
export const AuthDocumentSchema = type({
  id: "string",
  title: "string",
  "description?": "string",
  "links?": LinkSchema.array(),
  authentication: AuthenticationSchema.array(),
  "color_scheme?": "string",
  "web_color_scheme?": WebColorSchemeSchema,
  "service_description?": "string",
  "public_key?": PublicKeySchema,
  "features?": FeaturesSchema,
  "announcements?": AnnouncementSchema.array()
});

// -- Derived types ----------------------------------------------------------

export type AuthDocumentLink = typeof LinkSchema.infer;
export type AuthenticateLink = typeof AuthenticateLinkSchema.infer;
export type LocalizedValue = typeof LocalizedValueSchema.infer;
export type AuthenticationLabels = typeof AuthenticationLabelsSchema.infer;
export type AuthenticationInput = typeof AuthenticationInputSchema.infer;
export type AuthenticationInputs = typeof AuthenticationInputsSchema.infer;
export type Authentication = typeof AuthenticationSchema.infer;
export type Announcement = typeof AnnouncementSchema.infer;
export type WebColorScheme = typeof WebColorSchemeSchema.infer;
export type Features = typeof FeaturesSchema.infer;
export type PublicKey = typeof PublicKeySchema.infer;
export type AuthDocument = typeof AuthDocumentSchema.infer;

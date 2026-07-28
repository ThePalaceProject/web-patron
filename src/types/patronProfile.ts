/**
 * Patron Profile response JSON field names
 *
 * Note: Only include fields that are used in the app.
 */

export const PATRON_PROFILE_FIELDS = {
  authorizationIdentifier: "simplified:authorization_identifier"
} as const;

/**
 * The patron profile document, narrowed to the fields the app reads. The
 * circulation manager may omit any of them.
 */
export type PatronProfile = {
  [PATRON_PROFILE_FIELDS.authorizationIdentifier]?: string;
};

/* eslint-disable camelcase */

/**
 * ArkType runtime schemas for OPDS 2.0 catalog responses from a Palace
 * Circulation Manager.
 *
 * These schemas are aligned with the Pydantic models in the CM's
 * `palace-opds` package (opds2.py, rwpm.py, palace.py). The CM serializes
 * those models with `by_alias, exclude_unset, exclude_none` and drops empty
 * collections, so nearly every field can be absent on the wire — every key
 * here is optional. Several fields are unions by design:
 *
 * - LanguageMap fields (titles, contributor names) serialize as either a
 *   plain string or a `{lang: translation}` object.
 * - Contributor-role fields accept a string, an object, or an array of
 *   either.
 * - Link `rel` is a string or an array of strings.
 *
 * Validation of these schemas is telemetry-only: `lenientValidate` reports
 * mismatches to Bugsnag but always returns usable data, so schema drift in
 * the CM never surfaces as a user-facing error. The OPDS 2 mappers in
 * dataflow/opds2/parse.ts therefore treat all of this data defensively.
 */

import { type } from "arktype";
import track from "analytics/track";
import ApplicationError from "errors";

// -- Shared scalar shapes -----------------------------------------------------

export const LanguageMapSchema = type("string | Record<string, string>");

// -- Contributors and subjects ------------------------------------------------

export const Opds2ContributorSchema = type({
  "name?": LanguageMapSchema,
  "sortAs?": "string",
  "identifier?": "string",
  "position?": "number",
  "role?": "string | string[]",
  "links?": "unknown[]"
});

const ContributorEntry = Opds2ContributorSchema.or("string");
export const ContributorFieldSchema = ContributorEntry.or(
  ContributorEntry.array()
);

export const Opds2SubjectSchema = type({
  "name?": LanguageMapSchema,
  "sortAs?": "string",
  "code?": "string",
  "scheme?": "string",
  "links?": "unknown[]"
});

const SubjectEntry = Opds2SubjectSchema.or("string");
export const SubjectFieldSchema = SubjectEntry.or(SubjectEntry.array());

// -- Links ----------------------------------------------------------------------

export const AvailabilitySchema = type({
  "state?": "'available' | 'unavailable' | 'reserved' | 'ready'",
  "since?": "string",
  "until?": "string"
});

// Indirect acquisition chains nest recursively via `child`. They are
// validated shallowly here and walked defensively in the mapper.
export const AcquisitionObjectSchema = type({
  "type?": "string",
  "child?": "unknown[]"
});

export const Opds2LinkPropertiesSchema = type({
  "numberOfItems?": "number",
  "availability?": AvailabilitySchema,
  "holds?": { "total?": "number", "position?": "number" },
  "copies?": { "total?": "number", "available?": "number" },
  "indirectAcquisition?": AcquisitionObjectSchema.array(),
  "actions?": { "cancellable?": "boolean" },
  "licensor?": { "vendor?": "string", "clientToken?": "string" },
  "lcp_hashed_passphrase?": "string",
  '"http://palaceproject.io/terms/properties/default"?': "boolean"
});

export const Opds2LinkSchema = type({
  "href?": "string",
  "rel?": "string | string[]",
  "type?": "string",
  "title?": "string",
  "templated?": "boolean",
  "properties?": Opds2LinkPropertiesSchema
});

// -- Publications -----------------------------------------------------------------

export const Opds2PublicationMetadataSchema = type({
  "identifier?": "string",
  '"@type"?': "string",
  "title?": LanguageMapSchema,
  "subtitle?": LanguageMapSchema,
  "sortAs?": "string",
  "language?": "string | string[]",
  "modified?": "string",
  "published?": "string",
  "description?": "string",
  "duration?": "number",
  "numberOfPages?": "number",
  "abridged?": "boolean",
  "author?": ContributorFieldSchema,
  "narrator?": ContributorFieldSchema,
  "contributor?": ContributorFieldSchema,
  "publisher?": ContributorFieldSchema,
  "subject?": SubjectFieldSchema,
  "belongsTo?": {
    "series?": ContributorFieldSchema,
    "collection?": ContributorFieldSchema
  },
  "availability?": AvailabilitySchema,
  '"http://palaceproject.io/terms/timeTracking"?': "boolean"
});

export const Opds2PublicationSchema = type({
  "metadata?": Opds2PublicationMetadataSchema,
  "links?": Opds2LinkSchema.array(),
  "images?": Opds2LinkSchema.array()
});

// -- Feed --------------------------------------------------------------------------

export const Opds2FeedMetadataSchema = type({
  "title?": LanguageMapSchema,
  '"@type"?': "string",
  "subtitle?": LanguageMapSchema,
  "modified?": "string",
  "description?": "string",
  "itemsPerPage?": "number",
  "currentPage?": "number",
  "numberOfItems?": "number"
});

export const Opds2FacetSchema = type({
  "metadata?": Opds2FeedMetadataSchema,
  "links?": Opds2LinkSchema.array()
});

export const Opds2GroupSchema = type({
  "metadata?": Opds2FeedMetadataSchema,
  "links?": Opds2LinkSchema.array(),
  "publications?": Opds2PublicationSchema.array(),
  "navigation?": Opds2LinkSchema.array()
});

export const Opds2FeedSchema = type({
  "metadata?": Opds2FeedMetadataSchema,
  "links?": Opds2LinkSchema.array(),
  "publications?": Opds2PublicationSchema.array(),
  "navigation?": Opds2LinkSchema.array(),
  "facets?": Opds2FacetSchema.array(),
  "groups?": Opds2GroupSchema.array()
});

// -- Derived types -------------------------------------------------------------------

export type LanguageMap = typeof LanguageMapSchema.infer;
export type Opds2Contributor = typeof Opds2ContributorSchema.infer;
export type ContributorField = typeof ContributorFieldSchema.infer;
export type Opds2Subject = typeof Opds2SubjectSchema.infer;
export type SubjectField = typeof SubjectFieldSchema.infer;
export type Opds2Availability = typeof AvailabilitySchema.infer;
export type Opds2AcquisitionObject = typeof AcquisitionObjectSchema.infer;
export type Opds2LinkProperties = typeof Opds2LinkPropertiesSchema.infer;
export type Opds2Link = typeof Opds2LinkSchema.infer;
export type Opds2PublicationMetadata =
  typeof Opds2PublicationMetadataSchema.infer;
export type Opds2Publication = typeof Opds2PublicationSchema.infer;
export type Opds2FeedMetadata = typeof Opds2FeedMetadataSchema.infer;
export type Opds2Facet = typeof Opds2FacetSchema.infer;
export type Opds2Group = typeof Opds2GroupSchema.infer;
export type Opds2Feed = typeof Opds2FeedSchema.infer;

// -- Lenient validation ----------------------------------------------------------------

const MAX_REPORTS_PER_SESSION = 50;
const reportedMismatches = new Set<string>();

/**
 * Reports an OPDS 2 schema mismatch to Bugsnag at warning severity. Repeat
 * mismatches for the same URL path and leading finding are suppressed, and
 * reporting stops entirely past a session cap, so a systematically drifted
 * server does not flood error tracking.
 */
export function reportOpds2SchemaMismatch(url: string, summary: string): void {
  const key = `${url.split("?")[0]}|${summary.split("\n")[0]}`;
  if (
    reportedMismatches.has(key) ||
    reportedMismatches.size >= MAX_REPORTS_PER_SESSION
  ) {
    return;
  }
  reportedMismatches.add(key);
  track.error(
    new ApplicationError({
      title: "OPDS 2 Schema Mismatch",
      detail: `The OPDS 2 document at ${url} did not match the expected schema.`
    }),
    {
      severity: "warning",
      metadata: {
        "OPDS 2 Validation": { url, summary: summary.slice(0, 3000) }
      }
    }
  );
}

/** Clears mismatch dedupe state. Intended for use in tests only. */
export function resetOpds2MismatchReports(): void {
  reportedMismatches.clear();
}

/**
 * Validates an OPDS 2 document for telemetry only. On mismatch, the raw data
 * is returned as-is (cast to the schema type) so parsing can proceed
 * best-effort; downstream mappers must not rely on validation having
 * succeeded.
 */
export function lenientValidate<T>(
  schema: (data: unknown) => T | type.errors,
  data: unknown,
  url: string
): T {
  const result = schema(data);
  if (result instanceof type.errors) {
    reportOpds2SchemaMismatch(url, result.summary);
    return data as T;
  }
  return result;
}

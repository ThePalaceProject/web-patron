import { OPDSEntry, OPDSFeed } from "opds-feed-parser";
import ApplicationError, { ServerError } from "errors";
import { AnyBook, CollectionData, OPDS2 } from "interfaces";
import fetchWithHeaders from "dataflow/fetch";
import {
  fetchBook as fetchOpds1Book,
  fetchCollection as fetchOpds1Collection,
  parseOPDSText
} from "dataflow/opds1/fetch";
import {
  entryToBook,
  feedToCollection as opds1FeedToCollection
} from "dataflow/opds1/parse";
import {
  feedToCollection as opds2FeedToCollection,
  publicationToBook
} from "dataflow/opds2/parse";
import {
  lenientValidate,
  Opds2FeedSchema,
  Opds2PublicationSchema
} from "validation/opds2Catalog";

/**
 * Format-agnostic catalog fetching. When OPDS 2 is enabled, requests are
 * made with an Accept header preferring OPDS 2 (JSON) and the response
 * Content-Type decides which parser handles the body; servers that do not
 * serve OPDS 2 (including any that ignore the Accept header) fall back to
 * the OPDS 1.x (Atom) parser. When disabled, requests are delegated
 * unchanged to the OPDS 1.x fetchers.
 */

// Quality-ranked so that a Palace Circulation Manager negotiates OPDS 2
// while servers without OPDS 2 support still get an Accept value they can
// satisfy.
export const OPDS2_FEED_ACCEPT_HEADER = `${OPDS2.BaseDocumentMediaType}, application/atom+xml;q=0.9, */*;q=0.1`;
export const OPDS2_ENTRY_ACCEPT_HEADER = `${OPDS2.PublicationMediaType}, application/atom+xml;q=0.9, */*;q=0.1`;

let _opds2Enabled = false;

/** Sets whether to negotiate OPDS 2. Called once at app startup from _app.tsx. */
export function setOpds2Enabled(enabled: boolean): void {
  _opds2Enabled = enabled;
}

// Each fetcher matches only the OPDS 2 media types it can handle; anything
// else falls through to the Atom parser, which fails with a clear error
// instead of leniently mis-parsing the wrong document kind.
function isOpds2ContentType(contentType: string, expected: string[]): boolean {
  return expected.some(type => contentType.includes(type));
}

function parseOpds2Json(text: string, url: string): unknown {
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new ApplicationError(
      {
        title: "OPDS 2 Error",
        detail: `Could not parse the response as OPDS 2 JSON. Url: ${url}`
      },
      e
    );
  }
}

async function fetchNegotiated(
  url: string,
  token: string | undefined,
  additionalHeaders: { [key: string]: string }
): Promise<{ contentType: string; text: string }> {
  const response = await fetchWithHeaders(url, token, additionalHeaders);
  if (!response.ok) {
    const json = await response.json();
    throw new ServerError(url, response.status, json);
  }
  return {
    contentType: response.headers.get("content-type") ?? "",
    text: await response.text()
  };
}

/**
 * Fetches a feed and converts it to a collection
 */
export async function fetchCollection(
  url: string,
  token?: string
): Promise<CollectionData> {
  if (!_opds2Enabled) {
    return fetchOpds1Collection(url, token);
  }

  const { contentType, text } = await fetchNegotiated(url, token, {
    // Explicitly accept all languages when fetching feeds. Otherwise, the browser will send an
    // Accept-Language header for its current language, which causes books in other languages to
    // be filtered out of search results.
    "Accept-Language": "*",
    Accept: OPDS2_FEED_ACCEPT_HEADER
  });

  if (isOpds2ContentType(contentType, [OPDS2.BaseDocumentMediaType])) {
    const json = parseOpds2Json(text, url);
    const feed = lenientValidate(Opds2FeedSchema, json, url);
    return opds2FeedToCollection(feed, url);
  }

  const result = await parseOPDSText(text);
  if (result instanceof OPDSFeed) {
    return opds1FeedToCollection(result, url);
  }
  throw new ApplicationError({
    title: "OPDS Error",
    detail: `Network response was expected to be an OPDS 1.x Feed, but was not parseable as such. Url: ${url}`
  });
}

/**
 * Fetches an entry and converts it to a book
 */
export async function fetchBook(
  url: string,
  catalogUrl: string,
  token?: string
): Promise<AnyBook> {
  if (!_opds2Enabled) {
    return fetchOpds1Book(url, catalogUrl, token);
  }

  const { contentType, text } = await fetchNegotiated(url, token, {
    Accept: OPDS2_ENTRY_ACCEPT_HEADER
  });

  if (
    isOpds2ContentType(contentType, [
      OPDS2.PublicationMediaType,
      OPDS2.BaseDocumentMediaType
    ])
  ) {
    const json = parseOpds2Json(text, url);
    if (
      json !== null &&
      typeof json === "object" &&
      ("publications" in json || "groups" in json || "navigation" in json)
    ) {
      throw new ApplicationError({
        title: "OPDS 2 Error",
        detail: `Network response was expected to be an OPDS 2 Publication, but was a Feed. Url: ${url}`
      });
    }
    const publication = lenientValidate(Opds2PublicationSchema, json, url);
    return publicationToBook(publication, catalogUrl);
  }

  const result = await parseOPDSText(text);
  if (result instanceof OPDSEntry) {
    return entryToBook(result, catalogUrl);
  }
  throw new ApplicationError({
    title: "OPDS Error",
    detail: `Network response was expected to be an OPDS 1.x Entry, but was not parseable as such. Url: ${url}`
  });
}

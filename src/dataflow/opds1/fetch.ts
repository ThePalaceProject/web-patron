import OPDSParser, { OPDSFeed, OPDSEntry } from "opds-feed-parser";
import ApplicationError, { ServerError } from "errors";
import { AnyBook, CollectionData, OPDS1, Token } from "interfaces";
import { entryToBook, feedToCollection } from "dataflow/opds1/parse";
import fetchWithHeaders from "dataflow/fetch";
import parseSearchData from "dataflow/opds1/parseSearchData";

const parser = new OPDSParser();
/**
 * Function that will fetch opds and parse it into either
 * a Feed or an Entry
 */
export async function fetchOPDS(
  url: string,
  token?: string,
  additionalHeaders?: { [key: string]: string }
): Promise<OPDSEntry | OPDSFeed> {
  const response = await fetchWithHeaders(url, token, additionalHeaders);
  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!response.ok) {
    const json = await response.json();
    throw new ServerError(url, response.status, json);
  }

  const text = await response.text();

  try {
    // parse the text into an opds feed or entry
    return await parser.parse(text);
  } catch (e) {
    throw new ApplicationError(
      {
        title: "OPDS Error",
        detail: "Could not parse fetch response into an OPDS Feed or Entry"
      },
      e
    );
  }
}

/**
 * A function specifically for fetching a feed
 */
export async function fetchFeed(
  url: string,
  token?: string
): Promise<OPDSFeed> {
  const result = await fetchOPDS(url, token, {
    // Explicitly accept all languages when fetching feeds. Otherwise, the browser will send an
    // Accept-Language header for its current language, which causes books in other languages to
    // be filtered out of search results.
    "Accept-Language": "*"
  });
  if (result instanceof OPDSFeed) {
    return result;
  }
  throw new ApplicationError({
    title: "OPDS Error",
    detail: `Network response was expected to be an OPDS 1.x Feed, but was not parseable as such. Url: ${url}`
  });
}

/**
 * A function specifically for fetching an entry
 */
export async function fetchEntry(
  url: string,
  token?: string
): Promise<OPDSEntry> {
  const result = await fetchOPDS(url, token);
  if (result instanceof OPDSEntry) {
    return result;
  }
  throw new ApplicationError({
    title: "OPDS Error",
    detail: `Network response was expected to be an OPDS 1.x Entry, but was not parseable as such. Url: ${url}`
  });
}

/**
 * A function to fetch a feed and convert it to a collection
 */
export async function fetchCollection(
  url: string,
  token?: string
): Promise<CollectionData> {
  const feed = await fetchFeed(url, token);
  const collection = feedToCollection(feed, url);
  return collection;
}

/**
 * A function to fetch an entry and convert it to a book
 */
export async function fetchBook(
  url: string,
  catalogUrl: string,
  token?: string
): Promise<AnyBook> {
  const entry = await fetchEntry(url, token);
  const book = entryToBook(entry, catalogUrl);
  return book;
}

/**
 * Fetch a bearer token to use to download a book
 */
export async function fetchBearerToken(
  url: string,
  token?: string
): Promise<OPDS1.BearerTokenDocument> {
  const response = await fetchWithHeaders(url, token);
  const json = await response.json();

  if (!response.ok) {
    throw new ServerError(url, response.status, json);
  }

  return json;
}

/**
 * Utilities
 */

export function stripUndefined(json: any) {
  return JSON.parse(JSON.stringify(json));
}

/**
 * Fetches the search description for the catalog root, used for the global
 * search bar
 */
export async function fetchSearchData(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    const details = await response.json();
    throw new ServerError(url, response.status, details);
  }

  const text = await response.text();
  const data = await parseSearchData(text, url);
  return data;
}

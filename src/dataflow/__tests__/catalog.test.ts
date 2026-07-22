import { describe, expect, test } from "@jest/globals";
import fetchMock from "jest-fetch-mock";
import {
  fetchBook,
  fetchCollection,
  OPDS2_ENTRY_ACCEPT_HEADER,
  OPDS2_FEED_ACCEPT_HEADER
} from "dataflow/catalog";
import ApplicationError, { ServerError } from "errors";
import mockConfig from "test-utils/mockConfig";
import rawOpdsFeed from "test-utils/fixtures/raw-opds-feed";
import rawOpdsEntry from "test-utils/fixtures/raw-opds-entry";
import * as opds2 from "test-utils/fixtures/opds2-catalog";

afterEach(() => {
  mockConfig();
});

const OPDS2_FEED_HEADERS = { "content-type": "application/opds+json" };
const OPDS2_PUBLICATION_HEADERS = {
  "content-type": "application/opds-publication+json"
};
const ATOM_HEADERS = {
  "content-type": "application/atom+xml;profile=opds-catalog;kind=acquisition"
};

describe("with OPDS 2 disabled (default)", () => {
  test("fetchCollection sends no Accept header and parses OPDS 1", async () => {
    fetchMock.mockResponseOnce(rawOpdsFeed);
    const collection = await fetchCollection("http://somewhere");
    expect(collection.books).toHaveLength(6);
    expect(fetchMock).toHaveBeenCalledWith("http://somewhere", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Language": "*"
      },
      method: "GET"
    });
  });

  test("fetchBook sends no Accept header and parses OPDS 1", async () => {
    fetchMock.mockResponseOnce(rawOpdsEntry);
    const book = await fetchBook("/somewhere", "http://catalog.com");
    expect(book.authors).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledWith("/somewhere", {
      headers: { "X-Requested-With": "XMLHttpRequest" },
      method: "GET"
    });
  });
});

describe("with OPDS 2 enabled", () => {
  beforeEach(() => {
    mockConfig({ enableOpds2: true });
  });

  test("fetchCollection negotiates OPDS 2 and parses a JSON feed", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(opds2.groupedFeed), {
      headers: OPDS2_FEED_HEADERS
    });
    const collection = await fetchCollection(opds2.CATALOG_URL, "token");
    expect(collection.lanes).toHaveLength(2);
    expect(collection.title).toBe("Test Library");
    expect(fetchMock).toHaveBeenCalledWith(opds2.CATALOG_URL, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Language": "*",
        Accept: OPDS2_FEED_ACCEPT_HEADER,
        Authorization: "token"
      },
      method: "GET"
    });
  });

  test("fetchCollection falls back to OPDS 1 for Atom responses", async () => {
    fetchMock.mockResponseOnce(rawOpdsFeed, { headers: ATOM_HEADERS });
    const collection = await fetchCollection("http://somewhere");
    expect(collection.books).toHaveLength(6);
  });

  test("fetchCollection falls back to OPDS 1 when content-type is missing", async () => {
    fetchMock.mockResponseOnce(rawOpdsFeed);
    const collection = await fetchCollection("http://somewhere");
    expect(collection.books).toHaveLength(6);
  });

  test("fetchBook negotiates OPDS 2 and parses a publication", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(opds2.loanedPublication), {
      headers: OPDS2_PUBLICATION_HEADERS
    });
    const book = await fetchBook(
      "https://cm.example.com/works/6",
      opds2.CATALOG_URL
    );
    expect(book.title).toBe("Loaned Book");
    expect(book.status).toBe("fulfillable");
    expect(fetchMock).toHaveBeenCalledWith("https://cm.example.com/works/6", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: OPDS2_ENTRY_ACCEPT_HEADER
      },
      method: "GET"
    });
  });

  test("fetchBook parses an Atom entry response", async () => {
    fetchMock.mockResponseOnce(rawOpdsEntry, { headers: ATOM_HEADERS });
    const book = await fetchBook("/somewhere", "http://catalog.com");
    expect(book.authors).toHaveLength(2);
  });

  test("fetchCollection throws if an OPDS 2 response is a publication", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(opds2.loanedPublication), {
      headers: OPDS2_PUBLICATION_HEADERS
    });
    await expect(fetchCollection(opds2.CATALOG_URL)).rejects.toThrow(
      "Could not parse fetch response into an OPDS Feed or Entry"
    );
  });

  test("fetchBook throws if an OPDS 2 response is a feed", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(opds2.groupedFeed), {
      headers: OPDS2_PUBLICATION_HEADERS
    });
    await expect(
      fetchBook("https://cm.example.com/works/6", opds2.CATALOG_URL)
    ).rejects.toThrow(ApplicationError);
  });

  test("throws ServerError if the response is not ok", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ detail: "nope", title: "wrong", status: 418 }),
      { status: 418 }
    );
    await expect(fetchCollection("/some-url")).rejects.toThrow(ServerError);
  });

  test("throws ApplicationError on invalid JSON with an OPDS 2 content type", async () => {
    fetchMock.mockResponseOnce("this is not json", {
      headers: OPDS2_FEED_HEADERS
    });
    await expect(fetchCollection("/some-url")).rejects.toThrow(
      "Could not parse the response as OPDS 2 JSON"
    );
  });

  test("throws ApplicationError on unparseable non-OPDS 2 responses", async () => {
    fetchMock.mockResponseOnce("<html>an error page</html>", {
      headers: { "content-type": "text/html" }
    });
    await expect(fetchCollection("/some-url")).rejects.toThrow(
      ApplicationError
    );
  });
});

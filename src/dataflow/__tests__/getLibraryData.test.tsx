/* eslint-disable camelcase */
import { describe, expect, test } from "@jest/globals";
import {
  fetchAuthDocument,
  buildLibraryData,
  getAuthDocUrl,
  resetAuthDocCache
} from "../getLibraryData";
import fetchMock from "jest-fetch-mock";
import ApplicationError, { PageNotFoundError } from "errors";
import rawCatalog from "test-utils/fixtures/raw-opds-feed";
import { fixtures } from "test-utils";
import { OPDS1 } from "interfaces";
import { fetchFeed } from "dataflow/opds1/fetch";
import { getLibraries } from "server/libraryRegistry";

jest.mock("server/libraryRegistry", () => ({
  getLibraries: jest.fn()
}));

const mockGetLibraries = getLibraries as jest.MockedFunction<
  typeof getLibraries
>;

describe("fetching catalog", () => {
  test("calls fetch with catalog url", async () => {
    fetchMock.mockResponseOnce(rawCatalog);
    await fetchFeed("some-url");
    expect(fetchMock).toHaveBeenCalledWith("some-url", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Language": "*"
      },
      method: "GET"
    });
  });

  test("properly parses fetched catalog", async () => {
    fetchMock.mockResponseOnce(rawCatalog);
    const catalog = await fetchFeed("some-url");
    expect(catalog).toMatchSnapshot();
  });

  test("Throws error if catalog is not correct format", async () => {
    fetchMock.mockResponseOnce("something invalid");
    const promise = fetchFeed("a url somewhere");
    await expect(promise).rejects.toThrow(ApplicationError);
    await expect(promise).rejects.toThrow(
      "Could not parse fetch response into an OPDS Feed or Entry"
    );
  });

  test("Throws error if fetch fails", async () => {
    fetchMock.mockRejectOnce(new Error("Something wrong"));
    const promise = fetchFeed("not a valid url");
    await expect(promise).rejects.toThrow(Error);
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Fetch Error: The fetch promise for the requested resource was rejected. This is probably an offline, CORS, or other network error. Requested URL: not a valid url"`
    );
  });
});

describe("getAuthDocUrl", () => {
  test("throws PageNotFoundError if library is not found", async () => {
    mockGetLibraries.mockResolvedValueOnce({});
    const promise = getAuthDocUrl("not there slug");
    await expect(promise).rejects.toThrow(PageNotFoundError);
    await expect(promise).rejects.toMatchInlineSnapshot(
      `[Page Not Found Error: Page Not Found: No authentication document url is configured for the library: not there slug.]`
    );
  });

  test("returns url for a static library", async () => {
    mockGetLibraries.mockResolvedValueOnce({
      hello: { title: "hello", authDocUrl: "http://library.com" }
    });
    const promise = getAuthDocUrl("hello");
    await expect(promise).resolves.toBe("http://library.com");
  });

  test("returns url for a library sourced from a registry", async () => {
    mockGetLibraries.mockResolvedValueOnce({
      "uuid-abc": {
        id: "urn:uuid:abc",
        title: "Registry Lib",
        authDocUrl: "https://reg.example.com/auth"
      }
    });
    const url = await getAuthDocUrl("uuid-abc");
    expect(url).toBe("https://reg.example.com/auth");
  });
});

describe("fetchAuthDocument", () => {
  beforeEach(() => resetAuthDocCache());

  test("calls the auth document url and returns json", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        some: "json"
      })
    );

    const json = await fetchAuthDocument("/auth-doc");
    expect(fetchMock).toHaveBeenCalledWith("/auth-doc");
    expect(json).toEqual({
      some: "json"
    });
  });

  test("returns cached result without fetching on second call", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ cached: true }));
    await fetchAuthDocument("/auth-doc");
    fetchMock.mockClear();

    const result = await fetchAuthDocument("/auth-doc");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({ cached: true });
  });

  describe("refresh intervals", () => {
    const T0 = 1_000_000_000; // arbitrary fixed base time in ms

    afterEach(() => jest.restoreAllMocks());

    test("re-fetches when refreshMaxInterval has elapsed", async () => {
      jest.spyOn(Date, "now").mockReturnValue(T0);
      fetchMock.mockResponseOnce(JSON.stringify({ v: 1 }));
      await fetchAuthDocument("/auth-doc", {
        refreshMinInterval: 5,
        refreshMaxInterval: 10
      });

      jest.spyOn(Date, "now").mockReturnValue(T0 + 11_000);
      fetchMock.mockResponseOnce(JSON.stringify({ v: 2 }));
      const result = await fetchAuthDocument("/auth-doc", {
        refreshMinInterval: 5,
        refreshMaxInterval: 10
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ v: 2 });
    });

    test("does not re-fetch within refreshMinInterval", async () => {
      jest.spyOn(Date, "now").mockReturnValue(T0);
      fetchMock.mockResponseOnce(JSON.stringify({ v: 1 }));
      await fetchAuthDocument("/auth-doc", {
        refreshMinInterval: 30,
        refreshMaxInterval: 10
      });

      // maxInterval elapsed but minInterval has not
      jest.spyOn(Date, "now").mockReturnValue(T0 + 15_000);
      const result = await fetchAuthDocument("/auth-doc", {
        refreshMinInterval: 30,
        refreshMaxInterval: 10
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ v: 1 });
    });

    test("retries a failed first fetch even within refreshMinInterval", async () => {
      jest.spyOn(Date, "now").mockReturnValue(T0);
      fetchMock.mockRejectOnce(new Error("down"));
      await fetchAuthDocument("/auth-doc", { refreshMinInterval: 30 }).catch(
        () => {}
      );

      // Still within minInterval but no cached doc — should retry.
      jest.spyOn(Date, "now").mockReturnValue(T0 + 5_000);
      fetchMock.mockResponseOnce(JSON.stringify({ recovered: true }));
      const result = await fetchAuthDocument("/auth-doc", {
        refreshMinInterval: 30
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ recovered: true });
    });
  });

  test("coalesces concurrent requests for the same url", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ coalesced: true }));
    const [r1, r2, r3] = await Promise.all([
      fetchAuthDocument("/concurrent-doc"),
      fetchAuthDocument("/concurrent-doc"),
      fetchAuthDocument("/concurrent-doc")
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(r1).toEqual({ coalesced: true });
    expect(r2).toEqual(r1);
    expect(r3).toEqual(r1);
  });

  test("passes fetch errors through", async () => {
    fetchMock.mockRejectOnce(new Error("Something not right"));
    const promise = fetchAuthDocument("/some-url");
    await expect(promise).rejects.toThrow(Error);
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Something not right"`
    );
  });

  test("throws ServerError when response is not ok", async () => {
    const errorResponse = { title: "Unauthorized", detail: "Access denied" };
    fetchMock.mockResponseOnce(JSON.stringify(errorResponse), {
      status: 401
    });

    const promise = fetchAuthDocument("/auth-doc");

    await expect(promise).rejects.toThrow(ApplicationError);
    await expect(promise).rejects.toThrow("Unauthorized");
  });

  test("throws ServerError with error response status", async () => {
    // Create a mock response that's not ok
    const mockResponse = {
      ok: false,
      status: 403,
      json: jest.fn().mockResolvedValue({ error: "Forbidden" })
    };

    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(mockResponse as any)
    );

    const promise = fetchAuthDocument("/protected-doc");

    await expect(promise).rejects.toThrow(ApplicationError);
  });
});

describe("buildLibraryData", () => {
  test("returns correct response", () => {
    const library = buildLibraryData(fixtures.authDoc, "librarySlug");
    expect(library).toEqual({
      slug: "librarySlug",
      catalogUrl: "/catalog-root",
      catalogName: "auth doc title",
      logoUrl: null,
      colors: null,
      headerLinks: [],
      shelfUrl: "http://test-cm.com/shelf",
      userProfileUrl: "http://test-cm.com/patrons/me/",
      authMethods: [],
      libraryLinks: {}
    });
  });

  test("throws ApplicationError with auth doc URL, if auth doc has no catalog root url", () => {
    // Make sure that the error is actually thrown.
    expect.assertions(2);

    try {
      buildLibraryData(fixtures.authDocNoCatalogRoot, "librarySlug");
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.message).toBe(
        "Application Error: No Catalog Root URL present in Auth Document at /auth-doc."
      );
    }
  });

  test("throws ApplicationError without auth doc URL, if auth doc has no self url", () => {
    // Make sure that the error is actually thrown.
    expect.assertions(2);

    try {
      buildLibraryData(fixtures.authDocNoLinks, "librarySlug");
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.message).toBe(
        "Application Error: No Catalog Root URL present in Auth Document at (unknown: missing auth doc 'self' link or href)."
      );
    }
  });

  test("correctly parses web_color_scheme", () => {
    const library = buildLibraryData(
      {
        ...fixtures.authDoc,
        web_color_scheme: {
          primary: "blue",
          secondary: "red"
        }
      },
      "librarySlug"
    );
    expect(library.colors).toEqual({
      primary: "blue",
      secondary: "red"
    });
  });

  test("correctly parses links", () => {
    const links: OPDS1.AuthDocumentLink[] = [
      {
        rel: "about",
        href: "/about"
      },
      {
        rel: "alternate",
        href: "/alternate"
      },
      {
        rel: "privacy-policy",
        href: "/privacy-policy"
      },
      {
        rel: "terms-of-service",
        href: "/terms-of-service"
      },
      {
        rel: "help",
        href: "/help-website",
        type: "text/html"
      },
      {
        rel: "help",
        href: "helpEmail"
      },
      {
        rel: "register",
        href: "/register"
      },
      {
        rel: "logo",
        href: "/logo"
      },
      {
        rel: "navigation",
        href: "/navigation-one"
      },
      {
        rel: "navigation",
        href: "/navigation-two"
      },
      {
        rel: "start",
        href: "/catalog-root"
      }
    ];

    const library = buildLibraryData(
      {
        ...fixtures.authDoc,
        links
      },
      "librarySlug"
    );

    expect(library.headerLinks).toEqual([
      { rel: "navigation", href: "/navigation-one" },
      { rel: "navigation", href: "/navigation-two" }
    ]);

    expect(library.libraryLinks).toEqual({
      about: {
        rel: "about",
        href: "/about"
      },
      libraryWebsite: {
        rel: "alternate",
        href: "/alternate"
      },
      privacyPolicy: {
        rel: "privacy-policy",
        href: "/privacy-policy"
      },
      tos: {
        rel: "terms-of-service",
        href: "/terms-of-service"
      },
      helpWebsite: {
        rel: "help",
        type: "text/html",
        href: "/help-website"
      },
      helpEmail: {
        rel: "help",
        href: "helpEmail"
      }
    });

    expect(library.logoUrl).toBe("/logo");
  });
});

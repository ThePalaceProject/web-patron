import UrlShortener from "../UrlShortener";

describe("UrlShortener", () => {
  const host = "http://example.com/library/";
  const collectionUrl = "collection/url";
  const bookUrl = "book/url";

  describe("with shortening disabled", () => {
    const shortener = new UrlShortener(host, false);

    test("prepares collection url", () => {
      const url = host + collectionUrl;
      expect(shortener.prepareCollectionUrl(url)).toBe(
        "http%3A%2F%2Fexample.com%2Flibrary%2Fcollection%2Furl"
      );
    });

    test("prepares book url", () => {
      const url = host + bookUrl;
      expect(shortener.prepareBookUrl(url)).toBe(
        "http%3A%2F%2Fexample.com%2Flibrary%2Fbook%2Furl"
      );
    });

    test("expands collection url", () => {
      const url = host + collectionUrl;
      expect(shortener.expandCollectionUrl(url)).toBe(url);
    });

    test("expands book url", () => {
      const url = host + "works/" + bookUrl;
      expect(shortener.expandBookUrl(url)).toBe(url);
    });
  });

  describe("with shortening enabled", () => {
    const shortener = new UrlShortener(host, true);

    test("prepares collection url", () => {
      const url = host + collectionUrl;
      expect(shortener.prepareCollectionUrl(url)).toBe("collection%2Furl");
    });

    test("prepares book url", () => {
      let url = host + "works/" + bookUrl;
      expect(shortener.prepareBookUrl(url)).toBe("book%2Furl");
      // it preserves trailing slashes
      url += "/";
      expect(shortener.prepareBookUrl(url)).toBe("book%2Furl%2F");
      // but not starting slashes
      url = "/" + url;
      expect(shortener.prepareBookUrl(url)).toBe("book%2Furl%2F");
    });

    test("expands collection url", () => {
      const url = host + collectionUrl;
      expect(shortener.expandCollectionUrl(collectionUrl)).toBe(url);
    });

    test("expands book url", () => {
      const url = host + "works/" + bookUrl;
      expect(shortener.expandBookUrl(bookUrl)).toBe(url);
    });
  });
});

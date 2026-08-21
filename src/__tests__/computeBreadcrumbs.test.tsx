import { describe, expect, test } from "@jest/globals";
import computeBreadcrumbs from "../computeBreadcrumbs";
import { CollectionData, LinkData } from "interfaces";
import { TFunction } from "next-i18next/pages";

// Gives us the key back instead of English default,
// so we can test that the key was correctly passed through
const keyEcho = ((key: string) => key) as unknown as TFunction;

describe("computeBreadcrumbs", () => {
  const collection = {
    id: "id",
    url: "url",
    title: "title",
    lanes: [],
    books: [],
    navigationLinks: [],
    searchDataUrl: "/search-data-url"
  };

  test("uses breadcrumbs if they're in the raw collection data", () => {
    const raw = {
      "simplified:breadcrumbs": [
        {
          link: [
            {
              $: {
                href: { value: "breadcrumb url" },
                title: { value: "breadcrumb title" }
              }
            }
          ]
        }
      ]
    };
    const data = Object.assign({}, collection, { raw });
    const expected = [
      { url: "breadcrumb url", text: "breadcrumb title" },
      { url: collection.url, text: collection.title }
    ];
    expect(computeBreadcrumbs(data)).toEqual(expected);
  });

  test("ignores trailing slashes when using hierarchyComputeBreadcrumbs", () => {
    let catalogRootLink = {
      url: "url/",
      text: "text"
    };

    let data = Object.assign({}, collection, { catalogRootLink });
    let expected = [{ url: collection.url, text: collection.title }];
    expect(computeBreadcrumbs(data)).toEqual(expected);

    catalogRootLink = {
      url: "different url/",
      text: "text"
    };

    data = Object.assign({}, collection, { catalogRootLink });
    expected = [
      catalogRootLink,
      { url: collection.url, text: collection.title }
    ];
    expect(computeBreadcrumbs(data)).toEqual(expected);
  });

  describe("search results", () => {
    const catalogRootLink = {
      url: "http://cm.example/groups/",
      text: "All Books"
    };
    const parentLink = {
      url: "http://cm.example/feed/1120",
      text: "Adventure"
    };
    const searchCollection = Object.assign({}, collection, {
      url: "http://cm.example/search/1120?entrypoint=All&q=love",
      searchDataUrl: "http://cm.example/search/1120?entrypoint=All",
      catalogRootLink,
      parentLink
    });

    const urlWithTrailingSlash =
      "http://cm.example/search/1120/?entrypoint=All&q=love";
    const searchDataUrlWithTrailingSlash =
      "http://cm.example/search/1120/?entrypoint=All";

    const raw = {
      "simplified:breadcrumbs": [
        {
          link: [
            {
              $: {
                href: { value: catalogRootLink.url },
                title: { value: catalogRootLink.text }
              }
            },
            {
              $: {
                href: { value: parentLink.url },
                title: { value: parentLink.text }
              }
            }
          ]
        }
      ]
    };

    const simplifiedBreadcrumbsCases: Array<
      [string, CollectionData, Array<LinkData>]
    > = [
      [
        "matching pathnames have no trailing slashes",
        { ...searchCollection, raw },
        [catalogRootLink, { url: searchCollection.url, text: collection.title }]
      ],
      [
        "one pathname has a trailing slash",
        { ...searchCollection, url: urlWithTrailingSlash, raw },
        [catalogRootLink, { url: urlWithTrailingSlash, text: collection.title }]
      ],
      [
        "both matching pathnames have trailing slashes",
        {
          ...searchCollection,
          url: urlWithTrailingSlash,
          searchDataUrl: searchDataUrlWithTrailingSlash,
          raw
        },
        [catalogRootLink, { url: urlWithTrailingSlash, text: collection.title }]
      ]
    ];

    test.each(simplifiedBreadcrumbsCases)(
      "drops the lane when the search feed provides simplified:breadcrumbs where %s",
      (_label, collection, expected) =>
        expect(computeBreadcrumbs(collection)).toEqual(expected)
    );

    const hierachyCases: Array<[string, CollectionData, Array<LinkData>]> = [
      [
        "with matching pathnames that have no trailing slashes",
        searchCollection,
        [catalogRootLink, { url: searchCollection.url, text: collection.title }]
      ],
      [
        "where one pathname has a trailing slash",
        { ...searchCollection, url: urlWithTrailingSlash },
        [catalogRootLink, { url: urlWithTrailingSlash, text: collection.title }]
      ],
      [
        "that both have matching pathnames with trailing slashes",
        {
          ...searchCollection,
          url: urlWithTrailingSlash,
          searchDataUrl: searchDataUrlWithTrailingSlash
        },
        [catalogRootLink, { url: urlWithTrailingSlash, text: collection.title }]
      ]
    ];

    test.each(hierachyCases)(
      "drops the lane when the search feed only has hierarchy links %s",
      (_label, collection, expected) =>
        expect(computeBreadcrumbs(collection)).toEqual(expected)
    );

    test("keeps the lane on a browse feed", () => {
      const data = Object.assign({}, searchCollection, {
        url: "http://cm.example/feed/1120?entrypoint=All"
      });
      expect(computeBreadcrumbs(data)).toEqual([
        catalogRootLink,
        parentLink,
        { url: data.url, text: collection.title }
      ]);
    });

    test("treats a collection without a searchDataUrl as a browse feed", () => {
      const data = Object.assign({}, searchCollection, { searchDataUrl: null });
      expect(computeBreadcrumbs(data)).toEqual([
        catalogRootLink,
        parentLink,
        { url: searchCollection.url, text: collection.title }
      ]);
    });

    test("translates the search crumb when given a translation function", () => {
      expect(computeBreadcrumbs(searchCollection, keyEcho)).toEqual([
        catalogRootLink,
        { url: searchCollection.url, text: "collection.searchResults" }
      ]);
    });

    test("leaves a browse feed's own title untranslated", () => {
      const data = Object.assign({}, searchCollection, {
        url: "http://cm.example/feed/1120?entrypoint=All"
      });
      expect(computeBreadcrumbs(data, keyEcho)).toEqual([
        catalogRootLink,
        parentLink,
        { url: data.url, text: collection.title }
      ]);
    });
  });

  test("translates the catalog root fallback when the link has no text", () => {
    const data = Object.assign({}, collection, {
      catalogRootLink: { url: "different url", text: "" }
    });
    expect(computeBreadcrumbs(data, keyEcho)).toEqual([
      { url: "different url", text: "computeBreadcrumbs.catalog" },
      { url: collection.url, text: collection.title }
    ]);
  });
});

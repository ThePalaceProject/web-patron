import { describe, expect, test } from "@jest/globals";
import computeBreadcrumbs from "../computeBreadcrumbs";

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

    test("drops the lane when the search feed provides simplified:breadcrumbs", () => {
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
      const data = Object.assign({}, searchCollection, { raw });
      expect(computeBreadcrumbs(data)).toEqual([
        catalogRootLink,
        { url: searchCollection.url, text: collection.title }
      ]);
    });

    test("drops the lane when the search feed only has hierarchy links", () => {
      expect(computeBreadcrumbs(searchCollection)).toEqual([
        catalogRootLink,
        { url: searchCollection.url, text: collection.title }
      ]);
    });

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
  });
});

import { describe, expect, test } from "@jest/globals";
import { FacetGroupData } from "interfaces";
import { TFunction } from "next-i18next/pages";
import { translateFacetGroup } from "utils/facets";
import { mockUseTranslation } from "test-utils/mockUseTranslation";

const t = mockUseTranslation().t as unknown as TFunction;

// Gives us the key back instead of English default,
// so we can test that the key was correctly passed through
const keyEcho = ((key: string) => key) as unknown as TFunction;

const feed = (params: string) => `http://cm.test/feed?${params}`;

const groupOf = (
  label: string,
  param: string,
  values: string[],
  labels?: string[]
): FacetGroupData => {
  const shared = param === "order" ? "available=all" : "order=author";
  return {
    label,
    facets: values.map((value, index) => ({
      label: labels?.[index] ?? value,
      href: feed(`${shared}&${param}=${value}`),
      active: index === 0
    }))
  };
};

describe("Facet group headings", () => {
  test.each([
    ["Formats", "entrypoint", ["All", "Book"], "utils.facets.groupFormats"],
    ["Sort by", "order", ["title", "author"], "utils.facets.groupSortBy"],
    [
      "Availability",
      "available",
      ["now", "always"],
      "utils.facets.groupAvailability"
    ],
    [
      "Distributor",
      "distributor",
      ["All", "Overdrive"],
      "utils.facets.groupDistributor"
    ],
    [
      "Collection Name",
      "collectionName",
      ["All", "Palace Bookshelf"],
      "utils.facets.groupCollectionName"
    ]
  ])("%s uses %s", (label, param, values, expectedKey) => {
    const group = groupOf(label, param, values);
    expect(translateFacetGroup(group, keyEcho).label).toBe(expectedKey);
    expect(translateFacetGroup(group, keyEcho).id).toBe(param);
  });

  test("renders the English heading in English", () => {
    const group = groupOf("Sort by", "order", ["title", "author"]);
    expect(translateFacetGroup(group, t).label).toBe("Sort by");
  });
});

describe("facet values", () => {
  const keyFor = (param: string, value: string, label = value) =>
    translateFacetGroup(
      groupOf("group", param, [value, "zzz"], [label]),
      keyEcho
    ).facets[0].label;

  test.each([
    ["order", "title", "utils.facets.orderTitle"],
    ["order", "title_desc", "utils.facets.orderTitleDesc"],
    ["order", "author", "utils.facets.orderAuthor"],
    ["order", "author_desc", "utils.facets.orderAuthorDesc"],
    ["order", "added", "utils.facets.orderAdded"],
    ["order", "added_asc", "utils.facets.orderAddedAsc"],
    ["order", "last_update", "utils.facets.orderLastUpdate"],
    ["order", "series", "utils.facets.orderSeries"],
    ["order", "work_id", "utils.facets.orderWorkId"],
    ["available", "now", "utils.facets.availableNow"],
    ["available", "all", "utils.facets.availableAll"],
    ["available", "always", "utils.facets.availableAlways"],
    ["entrypoint", "All", "utils.facets.entrypointAll"],
    ["entrypoint", "Book", "utils.facets.entrypointBook"],
    ["entrypoint", "Audio", "utils.facets.entrypointAudio"],
    ["distributor", "All", "utils.facets.distributorAll"],
    ["collectionName", "All", "utils.facets.collectionNameAll"]
  ])("%s=%s", (param, value, expectedKey) => {
    expect(keyFor(param, value)).toBe(expectedKey);
  });

  test("entrypoint=Book renders as Ebooks in English", () => {
    const group = groupOf("Formats", "entrypoint", ["Book", "Audio"]);
    expect(translateFacetGroup(group, t).facets[0].label).toBe("Ebooks");
  });

  test("distributor names are left alone", () => {
    expect(keyFor("distributor", "Overdrive")).toBe("Overdrive");
    expect(
      keyFor("distributor", "Palace%20Marketplace", "Palace Marketplace")
    ).toBe("Palace Marketplace");
  });

  test("collection names are left alone", () => {
    expect(
      keyFor("collectionName", "Palace%20Bookshelf", "Palace Bookshelf")
    ).toBe("Palace Bookshelf");
  });

  test("unrecognized values fall back to the server label", () => {
    expect(keyFor("order", "relevance", "Relevance")).toBe("Relevance");
    expect(keyFor("available", "not_now", "Not available")).toBe(
      "Not available"
    );
  });

  test("href, active and order are preserved", () => {
    const group = groupOf("Sort by", "order", ["title", "author"]);
    const translated = translateFacetGroup(group, t);
    expect(translated.facets.map(facet => facet.href)).toEqual(
      group.facets.map(facet => facet.href)
    );
    expect(translated.facets.map(facet => facet.active)).toEqual([true, false]);
  });
});

describe("group identification", () => {
  const unrecognized = (group: FacetGroupData) => {
    const translated = translateFacetGroup(group, keyEcho);
    expect(translated.label).toBe(group.label);
    expect(translated.facets.map(facet => facet.label)).toEqual(
      group.facets.map(facet => facet.label)
    );
    return translated;
  };

  test("ignores known parameters that are constant across the group", () => {
    // `available=all` rides along on every link; only `order` varies.
    const group = groupOf("Sort by", "order", ["title", "author"]);
    expect(translateFacetGroup(group, keyEcho).id).toBe("order");
  });

  test("a group with one facet is not identified", () => {
    const group: FacetGroupData = {
      label: "Sort by",
      facets: [{ label: "Title", href: feed("order=title"), active: true }]
    };
    expect(unrecognized(group).id).toBe("Sort by");
  });

  test("unparseable hrefs are not identified", () => {
    const group: FacetGroupData = {
      label: "Sort by",
      facets: [
        { label: "Title", href: "not a url", active: true },
        { label: "Author", href: "also not a url", active: false }
      ]
    };
    expect(unrecognized(group).id).toBe("Sort by");
  });

  test("a group with no known parameter is not identified", () => {
    const group = groupOf(
      "Language",
      "language",
      ["eng", "fre"],
      ["English", "French"]
    );
    expect(unrecognized(group).id).toBe("Language");
  });

  test("a parameter missing from one facet is not the group key", () => {
    const group: FacetGroupData = {
      label: "Sort by",
      facets: [
        {
          label: "Title",
          href: feed("entrypoint=Book&order=title"),
          active: true
        },
        // No entrypoint here, so entrypoint can't be the group's parameter.
        { label: "Author", href: feed("order=author"), active: false }
      ]
    };
    expect(translateFacetGroup(group, keyEcho).id).toBe("order");
  });
});

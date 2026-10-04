import { describe, expect, test } from "@jest/globals";
import type { ClientLibrary } from "pages/api/libraries";
import {
  firstParamValue,
  parseLibraryListParam,
  resolveLibraryList
} from "utils/libraryListParam";

function lib(id: string, slug: string): ClientLibrary {
  return {
    id,
    slug,
    title: slug.toUpperCase(),
    authDocUrl: `https://example.com/${slug}/auth`
  };
}

describe("firstParamValue", () => {
  test("takes the first value of a repeated parameter", () => {
    expect(firstParamValue(["a", "b"])).toBe("a");
    expect(firstParamValue("a")).toBe("a");
    expect(firstParamValue(undefined)).toBeUndefined();
  });
});

describe("parseLibraryListParam", () => {
  test("splits, trims, and preserves order", () => {
    expect(parseLibraryListParam("beta, alpha ,gamma")).toEqual([
      "beta",
      "alpha",
      "gamma"
    ]);
  });

  test("drops empties and duplicates, handles arrays and undefined", () => {
    expect(parseLibraryListParam(",alpha,,alpha,")).toEqual(["alpha"]);
    expect(parseLibraryListParam(["alpha,beta", "gamma"])).toEqual([
      "alpha",
      "beta",
      "gamma"
    ]);
    expect(parseLibraryListParam(undefined)).toEqual([]);
  });
});

describe("resolveLibraryList", () => {
  const first = lib("clash", "first");
  const second = lib("urn:second", "clash");

  test("resolves ids and slugs in token order, ignoring unknowns", () => {
    expect(
      resolveLibraryList(["urn:second", "ghost", "first"], [first, second])
    ).toEqual([second, first]);
  });

  test("prefers an id match over a slug match", () => {
    expect(resolveLibraryList(["clash"], [first, second])).toEqual([first]);
  });

  test("resolves a library named by id and slug once", () => {
    expect(resolveLibraryList(["clash", "first"], [first, second])).toEqual([
      first
    ]);
  });
});

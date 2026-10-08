import { describe, expect, test } from "@jest/globals";
import type { ClientLibrary } from "pages/api/libraries";
import {
  firstParamValue,
  parseLibraryListParam,
  parsePromoteLabel,
  PROMOTE_LABEL_MAX_LENGTH,
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

describe("parsePromoteLabel", () => {
  test("trims the first value and treats a blank one as absent", () => {
    expect(parsePromoteLabel("  Springfield Schools ")).toBe(
      "Springfield Schools"
    );
    expect(parsePromoteLabel(["First", "Second"])).toBe("First");
    expect(parsePromoteLabel("   ")).toBeUndefined();
    expect(parsePromoteLabel(undefined)).toBeUndefined();
  });

  test("keeps a label of exactly the maximum length", () => {
    const label = "a".repeat(PROMOTE_LABEL_MAX_LENGTH);
    expect(parsePromoteLabel(label)).toBe(label);
  });

  test("cuts a longer label to the maximum length, ending in an ellipsis", () => {
    const label = parsePromoteLabel("a".repeat(PROMOTE_LABEL_MAX_LENGTH + 1));
    expect(label).toBe(`${"a".repeat(PROMOTE_LABEL_MAX_LENGTH - 1)}\u2026`);
  });

  test("drops a space left before the ellipsis", () => {
    const label = parsePromoteLabel(
      `${"a".repeat(PROMOTE_LABEL_MAX_LENGTH - 2)} bcd`
    );
    expect(label).toBe(`${"a".repeat(PROMOTE_LABEL_MAX_LENGTH - 2)}\u2026`);
  });

  test("counts characters, not UTF-16 units, so emoji are not split", () => {
    const label = parsePromoteLabel(
      "\u{1F4DA}".repeat(PROMOTE_LABEL_MAX_LENGTH + 1)
    );
    expect(Array.from(label!)).toHaveLength(PROMOTE_LABEL_MAX_LENGTH);
    expect(label!.endsWith("\u{1F4DA}\u2026")).toBe(true);
  });

  test.each([
    ["a URL with a scheme", "Visit https://example.org now"],
    ["a www address", "Go to www.example.org"],
    ["a bare domain", "Renew at example.com"],
    ["a domain in another script", "Visit \u4F8B\u3048.jp"],
    ["a domain with accented letters", "Visit b\u00FCcherei.de"],
    ["an IPv4 address", "Visit 203.0.113.5"],
    ["a bracketed IPv6 address", "Visit [2001:DB8::1]"],
    ["a short bracketed IPv6 address", "Visit [::1]"],
    ["an IPv4-mapped IPv6 address", "Visit [::ffff:192.0.2.1]"],
    ["an ideographic full stop", "Visit example\u3002com"],
    ["a halfwidth ideographic full stop", "Visit example\uFF61com"],
    ["an email address", "Write to help@example.org"],
    ["an email address at localhost", "Write to help@LocalHost"],
    ["localhost with a port", "Go to localhost:8080"],
    ["localhost inside a word", "MyLOCALHOSTServer"],
    ["a 10-digit phone number", "Call (555) 123-4567"],
    ["an international phone number", "Call +44 20 7946 0958"],
    ["a dotted phone number", "Call 555.123.4567"],
    ["a local phone number", "Call 555-1234"],
    ["full-width characters", "Write to help\uFF20example\uFF0Eorg"],
    ["contact details past the length limit", `${"a ".repeat(60)}example.com`]
  ])("rejects a label with %s", (_, value) => {
    expect(parsePromoteLabel(value)).toBeUndefined();
  });

  test.each([
    "Springfield School District 186",
    "Unified School District No. 259",
    "2024-2025 Summer Readers",
    "St. Louis Public Schools",
    "Grades 3 & 4",
    "Kids@Home Readers",
    "Story Time [10:30]",
    "Consortium <b>picks</b>"
  ])("keeps the ordinary label %p", value => {
    expect(parsePromoteLabel(value)).toBe(value);
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

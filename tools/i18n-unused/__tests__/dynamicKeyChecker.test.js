// Runs under the repo's default jsdom environment: jest.config.js loads
// src/test-utils/index.tsx via setupFilesAfterEnv, which needs DOM globals.

const { createDynamicKeyChecker } = require("../dynamicKeyChecker");

/**
 * Runs the checker the way i18n-unused does — mutating the key list in place —
 * and returns the keys that survive, i.e. the ones reported as unused.
 * @param {string[]} hits matcher hits for a single source file
 * @param {string[]} keys flat translation keys
 * @returns {string[]} the keys still considered unused
 */
function unusedAfterCheck(hits, keys) {
  const remaining = [...keys];

  createDynamicKeyChecker()(new Set(hits), remaining);

  return remaining;
}

describe("static keys", () => {
  it("removes keys that appear in a matcher hit", () => {
    expect(
      unusedAfterCheck(['t("footer.about")'], ["footer.about", "footer.terms"])
    ).toEqual(["footer.terms"]);
  });

  it("removes keys matched via an i18nKey attribute", () => {
    expect(
      unusedAfterCheck(
        ['i18nKey="openEbooksLanding.learnMoreLink"'],
        ["openEbooksLanding.learnMoreLink", "openEbooksLanding.title"]
      )
    ).toEqual(["openEbooksLanding.title"]);
  });

  it("keeps every key when the file has no matcher hits", () => {
    expect(unusedAfterCheck([], ["footer.about", "footer.terms"])).toEqual([
      "footer.about",
      "footer.terms"
    ]);
  });

  it("removes several keys from one file without skipping any", () => {
    expect(
      unusedAfterCheck(
        ['t("a.one")', 't("a.two")', 't("a.three")'],
        ["a.one", "a.two", "a.three", "a.four"]
      )
    ).toEqual(["a.four"]);
  });
});

describe("template literal keys", () => {
  it("removes every key the interpolation could produce", () => {
    expect(
      unusedAfterCheck(
        ["t(`a.b.${x}`)"],
        ["a.b.EN", "a.b.ES", "a.b.FR", "a.b.IT"]
      )
    ).toEqual([]);
  });

  it("does not let the wildcard cross a dot", () => {
    expect(unusedAfterCheck(["t(`a.b.${x}`)"], ["a.b.EN.x"])).toEqual([
      "a.b.EN.x"
    ]);
  });

  it("keeps keys outside the interpolated prefix", () => {
    expect(
      unusedAfterCheck(["t(`a.b.${x}`)"], ["a.c", "a.bXY", "a.b"])
    ).toEqual(["a.c", "a.bXY", "a.b"]);
  });

  it("handles more than one interpolation in a literal", () => {
    expect(
      unusedAfterCheck(
        ["t(`a.${x}.b.${y}`)"],
        ["a.one.b.two", "a.one.b", "a.one.c.two"]
      )
    ).toEqual(["a.one.b", "a.one.c.two"]);
  });

  it("handles a literal that begins with an interpolation", () => {
    expect(
      unusedAfterCheck(["t(`${ns}.title`)"], ["footer.title", "footer.a.title"])
    ).toEqual(["footer.a.title"]);
  });

  it("escapes regex metacharacters in the static part", () => {
    // the dots must match literal dots, not arbitrary characters
    expect(unusedAfterCheck(["t(`a.b.${x}`)"], ["aXbXEN"])).toEqual(["aXbXEN"]);
  });

  it("still matches static keys among other hits in the same file", () => {
    expect(
      unusedAfterCheck(["t(`a.b.${x}`)", 't("c.d")'], ["a.b.EN", "c.d", "c.e"])
    ).toEqual(["c.e"]);
  });
});

describe("prefix keys", () => {
  // a substring test cannot tell a whole key from part of a longer one, so
  // every orphan below used to be reported as used

  it("reports a key that is a prefix of a used key", () => {
    // "multiLibraryHome.noLibraries" was renamed to "...noLibrariesAvailable"
    expect(
      unusedAfterCheck(
        ['t("multiLibraryHome.noLibrariesAvailable", {'],
        [
          "multiLibraryHome.noLibrariesAvailable",
          "multiLibraryHome.noLibraries"
        ]
      )
    ).toEqual(["multiLibraryHome.noLibraries"]);
  });

  it("reports a parent key whose children are the ones used", () => {
    // "signedOut.securityNotice" was split into .header and .body1
    expect(
      unusedAfterCheck(
        [
          't("signedOut.securityNotice.header", {',
          't("signedOut.securityNotice.body1", {'
        ],
        [
          "signedOut.securityNotice.header",
          "signedOut.securityNotice.body1",
          "signedOut.securityNotice"
        ]
      )
    ).toEqual(["signedOut.securityNotice"]);
  });

  it("reports a malformed key ending in a trailing dot", () => {
    expect(
      unusedAfterCheck(
        ['t("openEbooksLanding.welcome", {'],
        ["openEbooksLanding.welcome", "openEbooksLanding."]
      )
    ).toEqual(["openEbooksLanding."]);
  });

  it("does not count key-shaped text inside a defaultValue as a usage", () => {
    // a matcher hit runs to the closing paren, so the whole call is in scope
    expect(
      unusedAfterCheck(
        ['t("footer.about", { defaultValue: "See footer.terms for details" })'],
        ["footer.about", "footer.terms"]
      )
    ).toEqual(["footer.terms"]);
  });
});

describe("plural keys", () => {
  // i18next stores one key per plural category but call sites pass the base
  // key, so every member of the group has to match that one usage

  it("removes every category when the base key is used", () => {
    expect(
      unusedAfterCheck(['t("a.b", { count })'], ["a.b_one", "a.b_other"])
    ).toEqual([]);
  });

  it("reports every category when the base key is never used", () => {
    expect(
      unusedAfterCheck(['t("a.c")'], ["a.b_one", "a.b_other", "a.c"])
    ).toEqual(["a.b_one", "a.b_other"]);
  });

  it("removes a category referenced verbatim", () => {
    expect(
      unusedAfterCheck(['t("a.b_one")'], ["a.b_one", "a.b_other"])
    ).toEqual(["a.b_other"]);
  });

  it("strips an ordinal suffix", () => {
    expect(
      unusedAfterCheck(['t("a.b", { ordinal: true })'], ["a.b_ordinal_two"])
    ).toEqual([]);
  });

  it("does not strip a suffix that is not a plural category", () => {
    expect(unusedAfterCheck(['t("a.b")'], ["a.b_custom"])).toEqual([
      "a.b_custom"
    ]);
  });

  it("matches the base form against a template literal pattern", () => {
    expect(unusedAfterCheck(["t(`a.${x}`)"], ["a.EN_one"])).toEqual([]);
  });

  it("does not let a stripped key match a shorter unrelated usage", () => {
    expect(unusedAfterCheck(['t("a.b")'], ["a.bother"])).toEqual(["a.bother"]);
  });
});

describe("utils.book regression", () => {
  const hits = [
    't("utils.book.more", "{{count}} more", { count: authors.length - 2 })'
  ];

  const keys = [
    "utils.book.authors_one",
    "utils.book.authors_other",
    "utils.book.more_one",
    "utils.book.more_other"
  ];

  it("reports the authors keys and keeps the more keys", () => {
    expect(unusedAfterCheck(hits, keys)).toEqual([
      "utils.book.authors_one",
      "utils.book.authors_other"
    ]);
  });
});

describe("LanguageSelector regression", () => {
  const hits = [
    "t(`languageSelector.languageName.${lang.toUpperCase()}`)",
    "t(`languageSelector.languageName.${currentLocale.toUpperCase()}`)",
    't("languageSelector.languageSelector", {'
  ];

  const keys = [
    "languageSelector.languageName.EN",
    "languageSelector.languageName.ES",
    "languageSelector.languageName.FR",
    "languageSelector.languageName.IT",
    "languageSelector.languageSelector"
  ];

  it("reports none of the languageSelector keys as unused", () => {
    expect(unusedAfterCheck(hits, keys)).toEqual([]);
  });

  it("still reports a genuinely dead key in the same namespace", () => {
    expect(unusedAfterCheck(hits, [...keys, "languageSelector.dead"])).toEqual([
      "languageSelector.dead"
    ]);
  });
});

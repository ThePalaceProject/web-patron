import { describe, expect, test } from "@jest/globals";
import { AnyBook, BookFormat, BookMedium } from "interfaces";
import { TFunction } from "next-i18next/pages";
import {
  bookIsAudiobook,
  getMedium,
  getMediumName,
  translateBookFormat,
  translateMedium
} from "utils/book";
import { mockUseTranslation } from "test-utils/mockUseTranslation";
import { makeBorrowableBooks } from "../../test-utils/fixtures/book";
import { getAuthors } from "../book";

const bookFixture = makeBorrowableBooks(1)[0];

const t = mockUseTranslation().t as unknown as TFunction;

describe("get authors", () => {
  /**
   * returns all authors default
   * returns limited number of authors
   * returns contributors if no authors
   * returns "Authors unknown" when neither
   */
  const someAuthors = ["Peter sieger", "Jeff", "Alan turing", "Boris Johnson"];
  test("returns all authors default", () => {
    const book = {
      ...bookFixture,
      authors: someAuthors
    };
    expect(getAuthors(book, t)).toBe(someAuthors);
  });

  test("returns limited number of authors when requested", () => {
    const book = {
      ...bookFixture,
      authors: someAuthors
    };
    expect(getAuthors(book, t, 2)).toStrictEqual(["Peter sieger", "Jeff"]);
  });

  test("returns contributors if no authors", () => {
    const book = {
      ...bookFixture,
      authors: [],
      contributors: someAuthors
    };
    expect(getAuthors(book, t)).toStrictEqual(someAuthors);
  });

  test("accepts contributors with special characters", () => {
    const book = {
      ...bookFixture,
      authors: [],
      contributors: ["J&#xF3;zsef Illy"]
    };

    expect(getAuthors(book, t)).toStrictEqual(["J&#xF3;zsef Illy"]);
  });

  test("returns 'Authors unknown' when neither authors nor contributors provided", () => {
    const book = {
      ...bookFixture,
      authors: [],
      contributors: []
    };
    expect(getAuthors(book, t)).toStrictEqual(["Authors unknown"]);
  });
});

describe("book is audiobook", () => {
  test("correctly recognizes audiobook", () => {
    const book: AnyBook = {
      ...bookFixture,
      raw: {
        $: {
          "schema:additionalType": {
            value: "http://bib.schema.org/Audiobook"
          }
        }
      }
    };

    expect(bookIsAudiobook(book)).toBe(true);
  });
});

describe("getMedium", () => {
  test("reads OPDS 2 metadata['@type'] for an audiobook", () => {
    const book: AnyBook = {
      ...bookFixture,
      raw: { metadata: { "@type": "http://schema.org/Audiobook" } }
    };

    expect(getMedium(book)).toBe("http://bib.schema.org/Audiobook");
  });

  test("reads OPDS 2 metadata['@type'] for an ebook", () => {
    const book: AnyBook = {
      ...bookFixture,
      raw: { metadata: { "@type": "http://schema.org/Book" } }
    };

    expect(getMedium(book)).toBe("http://schema.org/EBook");
  });

  test("falls back to the OPDS 1 schema:additionalType attribute", () => {
    const book: AnyBook = {
      ...bookFixture,
      raw: {
        $: {
          "schema:additionalType": {
            value: "http://bib.schema.org/Audiobook"
          }
        }
      }
    };

    expect(getMedium(book)).toBe("http://bib.schema.org/Audiobook");
  });

  test("returns an empty string when no medium can be determined", () => {
    const book: AnyBook = { ...bookFixture, raw: {} };

    expect(getMedium(book)).toBe("");
  });
});

describe("translateMedium", () => {
  test.each([
    ["http://bib.schema.org/Audiobook", "Audiobook"],
    ["http://schema.org/EBook", "eBook"],
    ["http://schema.org/Book", "Book"]
  ])("translates %s -> %s", (schema, expected) =>
    expect(translateMedium(schema as BookMedium, t)).toBe(expected)
  );
});

describe("getMediumName", () => {
  test("returns the translated name for a book with a medium", () => {
    const book: AnyBook = {
      ...bookFixture,
      raw: { metadata: { "@type": "http://schema.org/Audiobook" } }
    };

    expect(getMediumName(book, t)).toBe("Audiobook");
  });

  test("returns an empty string when no medium can be determined", () => {
    const book: AnyBook = { ...bookFixture, raw: {} };

    expect(getMediumName(book, t)).toBe("");
  });
});

describe("translateBookFormat", () => {
  // book formats will likely remain the same after translating,
  // but test ensures that t(...) returns strings as expected
  test.each([
    ["Audiobook", "Audiobook"],
    ["PDF", "PDF"],
    ["ePub", "ePub"]
  ])("translates %s -> %s", (format, expected) =>
    expect(translateBookFormat(format as BookFormat, t)).toBe(expected)
  );

  // DetailField hides the row on a falsy value, so this must stay undefined
  test("returns undefined when the book has no format", () => {
    expect(translateBookFormat(undefined, t)).toBeUndefined();
  });
});

import { afterEach, describe, expect, jest, test } from "@jest/globals";
import {
  AnyBook,
  BookAvailability,
  BookFormat,
  BookMedium,
  FulfillableBook,
  OnHoldBook
} from "interfaces";
import { TFunction } from "next-i18next/pages";
import {
  availabilityString,
  bookIsAudiobook,
  getMedium,
  getMediumName,
  translateBookFormat,
  translateMedium
} from "utils/book";
import { mockUseTranslation, withLocale } from "test-utils/mockUseTranslation";
import { makeBorrowableBooks, mergeBook } from "../../test-utils/fixtures/book";
import { formatAuthorList, getAuthorList, getAuthors } from "../book";
import { Language } from "utils/i18n";

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

describe("get author list", () => {
  const someAuthors = ["Peter sieger", "Jeff", "Alan turing", "Boris Johnson"];

  test("returns null when there are neither authors nor contributors", () => {
    const book = {
      ...bookFixture,
      authors: [],
      contributors: []
    };
    expect(getAuthorList(book)).toBeNull();
  });

  test("returns contributors when authors is undefined", () => {
    const book = {
      ...bookFixture,
      authors: undefined,
      contributors: someAuthors
    };
    expect(getAuthorList(book)).toStrictEqual(someAuthors);
  });

  test("returns limited number of authors when requested", () => {
    const book = {
      ...bookFixture,
      authors: someAuthors
    };
    expect(getAuthorList(book, 2)).toStrictEqual(["Peter sieger", "Jeff"]);
  });
});

describe("format author list", () => {
  test("joins with the separator the locale uses", () => {
    expect(formatAuthorList(["one", "two"], Language.EN)).toBe("one & two");
    expect(formatAuthorList(["one", "two"], Language.FR)).toBe("one et two");
    expect(formatAuthorList(["one", "two", "three"], Language.EN)).toBe(
      "one, two, & three"
    );
  });

  test("returns a lone author unchanged", () => {
    expect(formatAuthorList(["one"], Language.EN)).toBe("one");
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

describe("availabilityString", () => {
  const until = "2026-10-19T12:00:00Z";
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const withTimeLeft = (ms: number) =>
    jest.spyOn(Date, "now").mockReturnValue(Date.parse(until) - ms);

  afterEach(() => withLocale(Language.EN));

  const onLoan = (
    availability: { status: BookAvailability; until?: string } = {
      status: "available",
      until: until
    }
  ) =>
    mergeBook<FulfillableBook>({
      status: "fulfillable",
      revokeUrl: "/revoke",
      fulfillmentLinks: [],
      availability
    });

  const onHold = (
    availability: { status: BookAvailability; until?: string } = {
      status: "ready",
      until: until
    }
  ) =>
    mergeBook<OnHoldBook>({
      status: "on-hold",
      borrowUrl: "/borrow",
      availability
    });

  describe("fulfillable loans", () => {
    describe.each([
      {
        placement: "list",
        loanEnd: "Due October 19, 2026",
        loanEndDe: "Fällig am 19. Oktober 2026"
      },
      {
        placement: "details",
        loanEnd: "Borrowed until October 19, 2026",
        loanEndDe: "Ausgeliehen bis 19. Oktober 2026"
      }
    ] as const)("$placement placement", ({ placement, loanEnd, loanEndDe }) => {
      const availability = (loan = onLoan(), language = Language.EN) =>
        availabilityString(loan, t, language, placement);
      test.each([
        {
          remaining: "13 days and 23 hours",
          ms: 13 * DAY + 23 * HOUR,
          suffix: "(13 days left)"
        },
        { remaining: "1 day", ms: DAY, suffix: "(1 day left)" },
        {
          remaining: "23 hours and 59 minutes",
          ms: 23 * HOUR + 59 * MINUTE,
          suffix: "(23 hours left)"
        },
        { remaining: "1 hour", ms: HOUR, suffix: "(1 hour left)" },
        {
          remaining: "30 minutes",
          ms: 30 * MINUTE,
          suffix: "(less than an hour left)"
        }
      ])(
        "with $remaining remaining, shows the loan's end date and $suffix",
        ({ ms, suffix }) => {
          withTimeLeft(ms);
          expect(availability()).toBe(`${loanEnd} ${suffix}`);
        }
      );

      test("shows only the end date once the loan has passed", () => {
        withTimeLeft(-DAY);
        expect(availability()).toBe(loanEnd);
      });

      test.each([
        {
          reason: "has no end date",
          bookAvailability: { status: "available" }
        },
        {
          reason: "has an invalid end date",
          bookAvailability: { status: "available", until: "not-a-date" }
        }
      ] as const)(
        "shows nothing when a loan $reason",
        ({ bookAvailability }) => {
          expect(availability(onLoan(bookAvailability))).toBeNull();
        }
      );

      test("shows the formatted wording and date based on locale", () => {
        withLocale(Language.DE);
        withTimeLeft(-DAY);
        expect(availabilityString(onLoan(), t, Language.DE, placement)).toBe(
          loanEndDe
        );
      });
    });
  });

  describe("loans on hold", () => {
    test("shows a ready hold's end date", () => {
      expect(availabilityString(onHold(), t, Language.EN, "list")).toBe(
        "You have this book on hold until October 19, 2026."
      );
    });

    test("shows a ready hold without an end date", () => {
      expect(
        availabilityString(onHold({ status: "ready" }), t, Language.EN, "list")
      ).toBe("You have this book on hold.");
    });

    test("shows a ready hold without a valid end date", () => {
      expect(
        availabilityString(
          onHold({ status: "ready", until: "not-a-date" }),
          t,
          Language.EN,
          "list"
        )
      ).toBe("You have this book on hold.");
    });
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

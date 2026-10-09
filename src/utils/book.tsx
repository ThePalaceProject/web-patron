import * as React from "react";
import {
  AnyBook,
  BookFormat,
  BookMedium,
  BookMediumVariant,
  BorrowableBook,
  FulfillableBook,
  OnHoldBook,
  OPDS2,
  ReservableBook,
  ReservedBook,
  UnsupportedBook
} from "interfaces";
import { Book, Headset } from "../icons";
import { Language } from "./i18n";
import { formatDate, timeUntil } from "./date";
import { TFunction } from "next-i18next/pages";

export function getAuthorList(book: AnyBook, lim?: number): string[] | null {
  // select contributors if the authors array is undefined or empty.
  const allAuth =
    typeof book.authors?.length === "number" && book.authors.length > 0
      ? book.authors
      : typeof book.contributors?.length === "number" &&
          book.contributors.length > 0
        ? book.contributors
        : null;

  if (!allAuth) return null;

  // now limit it to however many
  if (lim) {
    return allAuth.slice(0, lim);
  }
  return allAuth;
}

/**
 * Joins author names the way the locale writes a list: "A & B" in English,
 * "A et B" in French.
 */
export function formatAuthorList(authors: string[], locale: Language): string {
  return new Intl.ListFormat(locale, { style: "short" }).format(authors);
}

export function getAuthors(
  book: AnyBook,
  t: TFunction,
  lim?: number
): string[] {
  return (
    getAuthorList(book, lim) ?? [
      t("utils.book.unknownAuthors", "Authors unknown")
    ]
  );
}

export function getAuthorsString(
  book: AnyBook,
  t: TFunction,
  locale: Language
): string {
  const allAuthors = getAuthorList(book);
  if (!allAuthors) return t("utils.book.unknownAuthor", "Unknown Author");

  const authorsArray = allAuthors.slice(0, 2);
  if (allAuthors.length > 2) {
    authorsArray.push(
      t("utils.book.more", "{{count}} more", { count: allAuthors.length - 2 })
    );
  }

  return formatAuthorList(authorsArray, locale);
}

// Where an availability string is shown, which decides its wording.
export type AvailabilityPlacement = "list" | "details";

export function availabilityString(
  book: AnyBook,
  t: TFunction,
  locale: Language,
  placement: AvailabilityPlacement
) {
  const status = book.status;

  switch (status) {
    case "borrowable":
    case "reservable":
      const availableCopies = book.copies?.available;
      const totalCopies = book.copies?.total;
      const queue =
        typeof book.holds?.total === "number" ? book.holds.total : null;

      if (
        typeof availableCopies === "number" &&
        typeof totalCopies === "number"
      ) {
        if (queue) {
          return t(
            "utils.book.availableCopiesWithQueue",
            "{{availableCopies}} out of {{totalCopies}} copies available. {{queue}} patrons in the queue.",
            { availableCopies, totalCopies, queue }
          );
        }

        return t(
          "utils.book.availableCopies",
          "{{availableCopies}} out of {{totalCopies}} copies available.",
          { availableCopies, totalCopies }
        );
      }

      return null;

    case "reserved":
      const position = book.holds?.position;
      if (!position || isNaN(position)) return null;

      // TODO: Incorrect pluralization (1 patrons) flagged for separate PR
      return t(
        "utils.book.positionInQueue",
        "{{position}} patrons ahead of you in the queue.",
        { position }
      );

    case "on-hold":
      const until = book.availability?.until
        ? formatDate(book.availability.until, locale, { utc: false })
        : undefined;

      if (until)
        return t(
          "utils.book.onHoldUntil",
          "You have this book on hold until {{until}}.",
          { until }
        );

      return t("utils.book.onHold", "You have this book on hold.");

    case "fulfillable":
      return loanEndString(book.availability?.until, t, locale, placement);

    case "unsupported":
      return null;
  }
}

// The end of a loan reads "Due…" in book lists and
// "Borrowed until…" on book details pages.
function loanEndString(
  until: string | undefined,
  t: TFunction,
  locale: Language,
  placement: AvailabilityPlacement
) {
  if (!until) return null;
  const availableUntil = formatDate(until, locale, { utc: false });
  if (!availableUntil) return null;

  const timeLeft = timeUntil(until);
  if (placement === "details") {
    switch (timeLeft?.unit) {
      case "days":
        return t(
          "utils.book.borrowedUntilDaysLeft",
          "Borrowed until {{availableUntil}} ({{count}} days left)",
          {
            availableUntil,
            count: timeLeft.count,
            defaultValue_one:
              "Borrowed until {{availableUntil}} ({{count}} day left)"
          }
        );
      case "hours":
        return t(
          "utils.book.borrowedUntilHoursLeft",
          "Borrowed until {{availableUntil}} ({{count}} hours left)",
          {
            availableUntil,
            count: timeLeft.count,
            defaultValue_one:
              "Borrowed until {{availableUntil}} ({{count}} hour left)"
          }
        );
      case "lessThanHour":
        return t(
          "utils.book.borrowedUntilLessThanHourLeft",
          "Borrowed until {{availableUntil}} (less than an hour left)",
          { availableUntil }
        );
      default:
        return t(
          "utils.book.borrowedUntil",
          "Borrowed until {{availableUntil}}",
          { availableUntil }
        );
    }
  }
  switch (timeLeft?.unit) {
    case "days":
      return t(
        "utils.book.dueDaysLeft",
        "Due {{availableUntil}} ({{count}} days left)",
        {
          availableUntil,
          count: timeLeft.count,
          defaultValue_one: "Due {{availableUntil}} ({{count}} day left)"
        }
      );
    case "hours":
      return t(
        "utils.book.dueHoursLeft",
        "Due {{availableUntil}} ({{count}} hours left)",
        {
          availableUntil,
          count: timeLeft.count,
          defaultValue_one: "Due {{availableUntil}} ({{count}} hour left)"
        }
      );
    case "lessThanHour":
      return t(
        "utils.book.dueLessThanHourLeft",
        "Due {{availableUntil}} (less than an hour left)",
        { availableUntil }
      );
    default:
      return t("utils.book.due", "Due {{availableUntil}}", {
        availableUntil
      });
  }
}

export function bookIsFulfillable(book: AnyBook): book is FulfillableBook {
  return book.status === "fulfillable";
}

export function bookIsUnsupported(book: AnyBook): book is UnsupportedBook {
  return book.status === "unsupported";
}

export function bookIsReserved(book: AnyBook): book is ReservedBook {
  return book.status === "reserved";
}

export function bookIsReservable(book: AnyBook): book is ReservableBook {
  return book.status === "reservable";
}

export function bookIsOnHold(book: AnyBook): book is OnHoldBook {
  return book.status === "on-hold";
}

export function bookIsBorrowable(book: AnyBook): book is BorrowableBook {
  return book.status === "borrowable";
}

export function bookIsAudiobook(book: AnyBook): boolean {
  if (getMedium(book) === "http://bib.schema.org/Audiobook") {
    return true;
  }
  return false;
}

// `variant` is for presentation (badge colors).
// The display name is translated separately by `translateMedium` below.
export const bookMediumMap: {
  [key in BookMedium]: {
    variant: BookMediumVariant;
    icon: React.ComponentType<{ className?: string }>;
  };
} = {
  "http://bib.schema.org/Audiobook": {
    variant: "audiobook",
    icon: Headset
  },
  "http://schema.org/EBook": { variant: "book", icon: Book },
  "http://schema.org/Book": { variant: "book", icon: Book }
};

export function translateMedium(medium: BookMedium, t: TFunction): string {
  switch (medium) {
    case "http://bib.schema.org/Audiobook":
      return t("utils.book.mediumAudiobook", "Audiobook");
    case "http://schema.org/EBook":
      return t("utils.book.mediumEbook", "eBook");
    case "http://schema.org/Book":
      return t("utils.book.mediumBook", "Book");
  }
}

// Returns undefined when the book has no format, so that DetailField hides the row.
// Note that PDF/ePub are format names translators will normally leave as-is.
export function translateBookFormat(
  format: BookFormat | undefined,
  t: TFunction
): string | undefined {
  switch (format) {
    case "Audiobook":
      return t("utils.book.formatAudiobook", "Audiobook");
    case "PDF":
      return t("utils.book.formatPdf", "PDF");
    case "ePub":
      return t("utils.book.formatEpub", "ePub");
    default:
      return undefined;
  }
}

// Return empty string if no medium found
// currently used for adding format to aria-label; it's okay if no medium is provided
export function getMediumName(book: AnyBook, t: TFunction): string {
  const medium = getMedium(book);

  if (!(medium in bookMediumMap)) {
    return "";
  }

  return translateMedium(medium as BookMedium, t);
}

export function getMedium(book: AnyBook): BookMedium | "" {
  // OPDS 2 publications carry the medium as metadata["@type"], with values
  // that differ from the Atom schema:additionalType ones; translate to the
  // internal BookMedium values.
  const opds2Type = book.raw?.metadata?.["@type"];
  if (opds2Type === OPDS2.AudiobookMetadataType) {
    return "http://bib.schema.org/Audiobook";
  }
  if (opds2Type === OPDS2.EBookMetadataType) {
    return "http://schema.org/EBook";
  }

  if (!book.raw || !book.raw["$"] || !book.raw["$"]["schema:additionalType"]) {
    return "";
  }

  return book.raw["$"]["schema:additionalType"].value
    ? book.raw["$"]["schema:additionalType"].value
    : "";
}

export function getLanguageLabel(
  book: AnyBook,
  locale: Language
): string | undefined {
  if (book?.language) {
    const languageNames = new Intl.DisplayNames([locale], { type: "language" });
    return languageNames.of(book.language.trim());
  }
  return undefined;
}

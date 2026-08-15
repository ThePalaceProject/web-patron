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
import { TFunction } from "next-i18next/pages";

export function getAuthors(
  book: AnyBook,
  t: TFunction,
  lim?: number
): string[] {
  // select contributors if the authors array is undefined or empty.
  const allAuth =
    typeof book.authors?.length === "number" && book.authors.length > 0
      ? book.authors
      : typeof book.contributors?.length === "number" &&
          book.contributors.length > 0
        ? book.contributors
        : [t("utils.book.unknownAuthors", "Authors unknown")];

  // now limit it to however many
  if (lim) {
    return allAuth.slice(0, lim);
  }
  return allAuth;
}

export function getAuthorsString(
  book: AnyBook,
  t: TFunction,
  locale: Language
): string {
  const { authors } = book;
  if (!authors) return t("utils.book.unknownAuthor", "Unknown Author");
  const authorsArray = getAuthors(book, t, 2);

  const listFormatter = new Intl.ListFormat(locale, {
    style: "short"
  });
  if (authors.length > 2) {
    authorsArray.push(
      t("utils.book.more", "{{count}} more", { count: authors.length - 2 })
    );
  }

  return listFormatter.format(authorsArray);
}

export function availabilityString(book: AnyBook, t: TFunction) {
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

      return t(
        "utils.books.positionInQueue",
        "{{position}} patrons ahead of you in the queue.",
        { position }
      );

    case "on-hold":
      const until = book.availability?.until
        ? new Date(book.availability.until).toDateString()
        : "NaN";
      const untilStr = until === "NaN" ? undefined : until;

      if (untilStr)
        return t(
          "utils.book.onHoldUntil",
          "You have this book on hold until {{until}}.",
          { until: untilStr }
        );

      return t("utils.book.onHold", "You have this book on hold.");

    case "fulfillable":
      const availableUntil = book.availability?.until
        ? new Date(book.availability.until).toDateString()
        : "NaN";

      return availableUntil !== "NaN"
        ? t(
            "utils.book.onLoanUntil",
            "You have this book on loan until {{availableUntil}}.",
            { availableUntil }
          )
        : null;

    case "unsupported":
      return null;
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

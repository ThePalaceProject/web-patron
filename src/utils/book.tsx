import * as React from "react";
import {
  BookData,
  FetchErrorData,
  BookMedium,
  MediaType,
  MediaLink,
  FulfillmentLink
} from "opds-web-client/lib/interfaces";
import moment from "moment";
import {
  bookIsOpenAccess,
  bookIsReserved,
  bookIsBorrowed,
  bookIsBorrowable
} from "opds-web-client/lib/utils/book";
import { Book, Headset } from "../icons";

export function getAuthors(book: BookData, lim?: number): string[] {
  // select contributors if the authors array is undefined or empty.
  const allAuth =
    typeof book.authors?.length === "number" && book.authors.length > 0
      ? book.authors
      : typeof book.contributors?.length === "number" &&
        book.contributors.length > 0
      ? book.contributors
      : ["Authors unknown"];

  // now limit it to however many
  if (lim) {
    return allAuth.slice(0, lim);
  }
  return allAuth;
}

export function dedupeLinks<T extends MediaLink>(links: T[]) {
  return links.reduce<T[]>((uniqueArr, current) => {
    const isDup = uniqueArr.find(
      uniqueLink => uniqueLink.type === current.type
    );

    return isDup ? uniqueArr : [...uniqueArr, current];
  }, []);
}

export type BookFullfillmentState =
  | "openAccess"
  | "availableToBorrow"
  | "availableToReserve"
  | "reserved"
  | "borrowed/protected"
  | "error";

export function getFulfillmentState(book: BookData): BookFullfillmentState {
  if (bookIsOpenAccess(book)) return "openAccess";
  if (bookIsBorrowed(book)) return "borrowed/protected";
  if (bookIsReserved(book)) return "reserved";

  const availableCopies = book?.copies?.available;
  const totalCopies = book?.copies?.total;

  if (
    typeof book.borrowUrl === "string" &&
    typeof availableCopies === "number" &&
    typeof totalCopies === "number"
  ) {
    if (availableCopies > 0) return "availableToBorrow";
    return "availableToReserve";
  }

  return "error";
}

export function getErrorMsg(error: FetchErrorData | null): string | null {
  const response = error?.response;
  if (response) {
    try {
      const responseObj = JSON.parse(response);
      // try to get the debug_message but otherwise just return
      // the full response as a string.
      // eslint-disable-next-line camelcase
      return responseObj?.debug_message ?? response;
    } catch {
      // it's not valid json. Just return it.
      return response;
    }
  }
  return null;
}

export const bookMediumMap: {
  [key in BookMedium]: React.ReactNode;
} = {
  "http://bib.schema.org/Audiobook": {
    name: "Audiobook",
    icon: Headset
  },
  "http://schema.org/EBook": { name: "eBook", icon: Book },
  "http://schema.org/Book": { name: "Book", icon: Book }
};

import { BookData } from "opds-web-client/lib/interfaces";
import * as moment from "moment";

export const getAvailabilityString = (book: BookData): string => {
  if (isOpenAccess(book)) {
    return "This open-access book is available to keep.";
  }

  if (isBorrowed(book)) {
    const availableUntil = book?.availability?.until;
    if (availableUntil) {
      const timeLeft = moment(availableUntil).fromNow(true);
      return `You have this book on loan for ${timeLeft}`;
    }
    // you have borrowed the book but it is unknown until when
    return "You have this book on loan";
  }

  const availableCopies = book?.copies?.available;
  const totalCopies = book?.copies?.total;
  const totalHolds = book?.holds?.total;
  const holdsPosition = book?.holds?.position;

  let availabilityString = "";
  // there is a number of copies available that is known
  if (availableCopies && totalCopies) {
    // show how many available, even if all are taken
    availabilityString += `${availableCopies} of ${totalCopies} copies available.`;

    // there is a queue
    if (totalHolds && availableCopies === 0) {
      availabilityString += ` ${totalHolds} patrons in queue.`;

      if (isReserved(book) && typeof holdsPosition === "number") {
        availabilityString += ` Your hold position: ${holdsPosition}.`;
      }
    }

    return availabilityString;
  }
  // the number of available copies is unknown
  return "Availability unknown";
};

export const isReserved = (book: BookData): boolean => {
  return book?.availability?.status === "reserved";
};

export const isOpenAccess = (book: BookData): boolean => {
  const numLinks = book?.openAccessLinks?.length ?? 0;
  return numLinks > 0;
};

export const isBorrowed = (book: BookData): boolean => {
  const numberOfLinks = book?.fulfillmentLinks?.length ?? 0;
  return numberOfLinks > 0;
};

type CirculationLink = {
  isOpenAccess: boolean;
  isBorrowed: boolean;
};

export const getCirculationLinkMap = (book: BookData) => {
  /**
   * This should mirror the OPDS logic, but instead of returning an array
   * of components, it returns a map of links, which lets the consumer render
   * those links however they desire. It will give you all the possible links,
   * and the info needed to render them properly
   * - Open Access links are the first option, shown whether borrowed or not
   * - If not open access, you must borrow first. set isBorrowed to false
   * -
   */
};

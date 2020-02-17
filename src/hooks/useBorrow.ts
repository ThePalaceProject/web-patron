import * as React from "react";
import { BookData, RequiredKeys } from "opds-web-client/lib/interfaces";
import useTypedSelector from "./useTypedSelector";
import { getErrorMsg, getAvailabilityString } from "../utils/book";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import {
  bookIsReserved,
  bookIsReady,
  bookIsBorrowed,
  bookIsBorrowable
} from "opds-web-client/lib/utils/book";

export default function useBorrow(book: BookData) {
  const bookError = useTypedSelector(state => state.book?.error);
  const errorMsg = getErrorMsg(bookError);
  const availability = getAvailabilityString(book);
  const { actions, dispatch } = useActions();
  const loansUrl = useTypedSelector(state => state.loans.url);

  // Book can either be available to borrow, available to reserve, or reserved
  const isReserved = bookIsReserved(book);
  // if it is not reserved and not reservable, then it is borrowable
  const isReservable =
    !isReserved && !bookIsReady(book) && book.copies?.available === 0;

  const isBorrowed = bookIsBorrowed(book);
  const isBorrowable = bookIsBorrowable(book);

  const label = isReserved
    ? "Reserved"
    : isReservable
    ? "Reserve"
    : isBorrowed
    ? "Borrowed"
    : "Borrow";

  const borrowOrReserve = async () => {
    if (book.borrowUrl) {
      await dispatch(actions.updateBook(book.borrowUrl));
    } else {
      throw Error("No borrow url present for book");
    }
    // refetch the loans
    if (loansUrl) {
      await dispatch(actions.fetchLoans(loansUrl));
    }
  };

  return {
    availability,
    borrowOrReserve,
    isReserved,
    isReservable,
    isBorrowed,
    isBorrowable,
    errorMsg,
    label
  };
}

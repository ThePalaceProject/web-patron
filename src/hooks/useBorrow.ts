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
  const [isLoading, setLoading] = React.useState(false);
  const bookError = useTypedSelector(state => state.book?.error);
  const errorMsg = getErrorMsg(bookError);
  const availability = getAvailabilityString(book);
  const { actions, dispatch } = useActions();
  const loansUrl = useTypedSelector(state => state.loans.url);
  const state = useTypedSelector(state => state);
  console.log(state);

  // Book can either be available to borrow, available to reserve, or reserved
  const isReserved = bookIsReserved(book);
  // if it is not reserved and not reservable, then it is borrowable
  const isReservable =
    !isReserved && !bookIsReady(book) && book.copies?.available === 0;

  const isBorrowed = bookIsBorrowed(book);
  const isBorrowable = bookIsBorrowable(book);

  const label = isLoading
    ? "Loading..."
    : isReserved
    ? "Reserved"
    : isReservable
    ? "Reserve"
    : isBorrowed
    ? "Borrowed"
    : "Borrow";

  const borrowOrReserve = async () => {
    if (book.borrowUrl) {
      setLoading(true);
      await dispatch(actions.updateBook(book.borrowUrl));
      setLoading(false);
    } else {
      throw Error("No borrow url present for book");
    }
    // refetch the loans
    if (loansUrl) {
      await dispatch(actions.fetchLoans(loansUrl));
    }
  };

  return {
    isLoading,
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

import * as React from "react";
import { BookData } from "opds-web-client/lib/interfaces";
import useTypedSelector from "./useTypedSelector";
import { getErrorMsg, getFulfillmentState } from "utils/book";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";

export default function useBorrow(book: BookData) {
  const [isLoading, setLoading] = React.useState(false);
  const bookError = useTypedSelector(state => state.book?.error);
  const errorMsg = getErrorMsg(bookError);
  const { actions, dispatch } = useActions();
  const loansUrl = useTypedSelector(state => state.loans.url);
  const fulfillmentState = getFulfillmentState(book);

  const availableCopies = book.copies?.available;
  const totalCopies = book.copies?.total;
  const holds = book.holds?.total;

  const title =
    fulfillmentState === "availableToBorrow"
      ? "This book is available to borrow!"
      : "This book is currently unavailable.";

  const subtitle =
    typeof availableCopies === "number" && typeof totalCopies === "number"
      ? `${availableCopies} out of ${totalCopies} copies available.${
          typeof holds === "number" ? ` ${holds} patrons in the queue.` : ""
        }`
      : "Number of books available is unknown.";

  const buttonLabel =
    fulfillmentState === "availableToBorrow" ? "Borrow" : "Reserve";
  const buttonLoadingText =
    fulfillmentState === "availableToBorrow" ? "Borrowing..." : "Reserving...";

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
    title,
    subtitle,
    buttonLabel,
    buttonLoadingText,
    isLoading,
    borrowOrReserve,
    errorMsg
  };
}

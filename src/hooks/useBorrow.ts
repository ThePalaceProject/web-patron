import * as React from "react";
import { BookData, MediaLink } from "opds-web-client/lib/interfaces";
import useTypedSelector from "./useTypedSelector";
import { getErrorMsg } from "utils/book";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import { OPDSAcquisitionLink } from 'opds-feed-parser';

export default function useBorrow(book: BookData) {
  const isUnmounted = React.useRef(false);
  const [isLoading, setLoading] = React.useState(false);
  const bookError = useTypedSelector(state => state.book?.error);
  const errorMsg = getErrorMsg(bookError);
  const { actions, dispatch } = useActions();
  const loansUrl = useTypedSelector(state => state.loans.url);
  const allBorrowLinks = book.allBorrowLinks;

  const borrowOrReserve = async (url) => {
    if (url) {
      setLoading(true);
      await dispatch(actions.updateBook(url));
      if (!isUnmounted.current) setLoading(false);
    } else {
      throw Error("No borrow url present for book");
    }
    // refetch the loans
    if (loansUrl) {
      await dispatch(actions.fetchLoans(loansUrl));
    }
  };

  React.useEffect(
    () => () => {
      isUnmounted.current = true;
    },
    []
  );

  return {
    isLoading,
    borrowOrReserve,
    allBorrowLinks,
    errorMsg
  };
}

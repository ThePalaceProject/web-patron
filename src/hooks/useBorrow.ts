import * as React from "react";
import { BookData } from "opds-web-client/lib/interfaces";
import useTypedSelector from "./useTypedSelector";
import { getErrorMsg } from "utils/book";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import { userEvent } from "analytics/track";

export default function useBorrow(book: BookData, type: "borrow" | "reserve") {
  const isUnmounted = React.useRef(false);
  const [isLoading, setLoading] = React.useState(false);
  const bookError = useTypedSelector(state => state.book?.error);
  const errorMsg = getErrorMsg(bookError);
  const { actions, dispatch } = useActions();

  const borrowOrReserve = async () => {
    if (book.borrowUrl) {
      setLoading(true);
      trackBorrowOrReserve(book, type);
      await dispatch(actions.updateBook(book.borrowUrl));
      if (!isUnmounted.current) setLoading(false);
    } else {
      throw Error("No borrow url present for book");
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
    errorMsg
  };
}

function trackBorrowOrReserve(book: BookData, type: "borrow" | "reserve") {
  userEvent(type === "borrow" ? "borrowed_book" : "reserved_book", {
    title: book.title,
    authors: book.authors,
    availability: book.availability,
    borrowUrl: book.borrowUrl,
    url: book.url,
    publisher: book.publisher,
    published: book.published,
    categories: book.categories,
    language: book.language
  });
}

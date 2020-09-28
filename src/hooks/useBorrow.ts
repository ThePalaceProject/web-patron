import * as React from "react";
import { BookData, FulfillmentLink } from "interfaces";
import { fetchBook } from "dataflow/opds1/fetch";
import useUser from "components/context/UserContext";
import useLibraryContext from "components/context/LibraryContext";
import { ServerError } from "errors";
import useAuthFormContext from "auth/AuthFormCotext";

export default function useBorrow(
  book: BookData,
  isBorrow: boolean,
  borrowLink: FulfillmentLink
) {
  const { catalogUrl } = useLibraryContext();
  const { setBook, token } = useUser();
  const { showForm } = useAuthFormContext();
  const isUnmounted = React.useRef(false);
  const [isLoading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const loadingText = isBorrow ? "Borrowing..." : "Reserving...";
  const buttonLabel = isBorrow
    ? borrowLink.indirectType ===
      "application/vnd.librarysimplified.axisnow+json"
      ? "Borrow to read online"
      : "Borrow to read on a mobile device"
    : "Reserve";

  const borrowOrReserve = async (url: string) => {
    setLoading(true);
    setError(undefined);
    if (!token) {
      // TODO: register a callback to call if the sign in works
      showForm();
      setError("You must be signed in to borrow this book.");
      setLoading(false);
      return;
    }
    try {
      const book = await fetchBook(url, catalogUrl, token);
      console.log("calling set book");
      setBook(book);
    } catch (e) {
      // TODO: Report error to bug catcher here.
      if (e instanceof ServerError) {
        console.log("ERR", e.info);
        setError(e.info.detail);
      } else {
        setError("An error occurred while borrowing this book.");
      }
    }

    if (!isUnmounted.current) setLoading(false);
  };

  React.useEffect(
    () => () => {
      isUnmounted.current = true;
    },
    []
  );

  return {
    isLoading,
    loadingText,
    buttonLabel,
    borrowOrReserve,
    error
  };
}

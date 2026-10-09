import * as React from "react";
import { fetchBook } from "dataflow/catalog";
import useUser from "components/context/UserContext";
import useLibraryContext from "components/context/LibraryContext";
import useError from "hooks/useError";
import useLogin from "auth/useLogin";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next/pages";
import { useAnnounce } from "components/context/AnnouncerContext";
import { availabilityAnnouncement } from "components/BookStatus";
import useLocale from "hooks/useLocale";
import { AvailabilityPlacement } from "utils/book";

export default function useBorrow(
  isBorrow: boolean,
  placement: AvailabilityPlacement
) {
  const { t } = useTranslation("common");
  const { t: tTranslations } = useTranslation();
  const locale = useLocale();
  const announce = useAnnounce();
  const { catalogUrl } = useLibraryContext();
  const { setBook, token } = useUser();
  const { initLogin } = useLogin();
  const { push } = useRouter();
  const isUnmounted = React.useRef(false);
  const [isLoading, setLoading] = React.useState(false);
  const { error, handleError, setErrorString, clearError } = useError();

  const loadingText = isBorrow
    ? t("actions.borrowing", "Borrowing...")
    : t("actions.reserving", "Reserving...");
  const buttonLabel = isBorrow
    ? t("actions.borrow", "Borrow")
    : t("actions.reserve", "Reserve");

  const borrowOrReserve = async (url: string) => {
    clearError();
    if (!token) {
      // Use push (not initLogin's replace default) so the book page is preserved in
      // history and the back button returns here after sign-in or cancel.
      initLogin(undefined, undefined, true, push);
      setErrorString(
        t(
          "auth.mustBeSignedInToBorrowBook",
          "You must be signed in to borrow this book."
        )
      );
      return;
    }
    setLoading(true);
    try {
      const book = await fetchBook(url, catalogUrl, token);
      setBook(book);
      // Tell screen readers the new loan end date or hold position.
      const announcement = availabilityAnnouncement(
        book,
        tTranslations,
        locale,
        placement
      );
      if (announcement) announce(announcement);
    } catch (e) {
      handleError(e);
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

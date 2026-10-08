import * as React from "react";
import { BookList } from "./BookList";
import Head from "next/head";
import BreadcrumbBar from "./BreadcrumbBar";
import { H2 } from "./Text";
import { AnyBook } from "interfaces";
import PageTitle from "./PageTitle";
import useUser from "components/context/UserContext";
import { PageLoader } from "components/LoadingIndicator";
import AuthProtectedRoute from "auth/AuthProtectedRoute";
import { useTranslation } from "next-i18next/pages";

const availableUntil = (book: AnyBook) =>
  book.availability?.until ? new Date(book.availability.until) : "NaN";

function sortBooksByLoanExpirationDate(books: AnyBook[]) {
  return books.sort((a, b) => {
    const aDate = availableUntil(a);
    const bDate = availableUntil(b);
    // if there is no availability info for either, compare their titles
    if (typeof aDate === "string" && typeof bDate === "string") {
      return compareTitles(a, b);
    }
    // if only one has a defined availability, it goes on top
    if (typeof aDate === "string") return 1;
    if (typeof bDate === "string") return -1;
    // if both have defined availabilities, sort by date
    if (aDate < bDate) return -1;
    if (aDate > bDate) return 1;
    // if both dates are the same, sort by title
    return compareTitles(a, b);
  });
}

function compareTitles(a: AnyBook, b: AnyBook): 0 | -1 | 1 {
  if (a.title > b.title) return 1;
  return -1;
}

// A shelf book has these statuses only as the optimistic result of a return
// or a cancelled reservation, until the shelf is fetched again.
const isOnShelf = (book: AnyBook) =>
  book.status !== "borrowable" && book.status !== "reservable";

/**
 * When the focused book leaves the list, e.g. after a return, focuses the
 * book now in its place, or the empty message if none are left.
 */
function useFocusAfterRemoval(
  ids: string[],
  contentRef: React.RefObject<HTMLElement | null>,
  emptyRef: React.RefObject<HTMLElement | null>
) {
  const lastFocused = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    const onFocusIn = (event: FocusEvent) => {
      if (
        event.target instanceof HTMLElement &&
        contentRef.current?.contains(event.target)
      ) {
        lastFocused.current = event.target;
      }
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [contentRef]);

  // A string, so the effect below runs only when the shown ids change.
  const idsKey = JSON.stringify(ids);
  const previousIds = React.useRef<string[]>(ids);

  React.useEffect(() => {
    const currentIds: string[] = JSON.parse(idsKey);
    const removedFrom = previousIds.current;
    previousIds.current = currentIds;

    const removedAt = removedFrom.findIndex(id => !currentIds.includes(id));
    if (removedAt === -1) return;
    // Focus was lost only if the last element focused in the list was
    // removed and nothing else has taken focus since.
    const active = document.activeElement;
    if (active && active !== document.body) return;
    if (!lastFocused.current || lastFocused.current.isConnected) return;
    lastFocused.current = null;

    if (currentIds.length === 0) {
      emptyRef.current?.focus();
      return;
    }
    const neighborId = currentIds[Math.min(removedAt, currentIds.length - 1)];
    const item = Array.from(
      contentRef.current?.querySelectorAll<HTMLElement>("li[data-book-id]") ??
        []
    ).find(li => li.dataset.bookId === neighborId);
    item?.querySelector<HTMLElement>("h2 a")?.focus();
  }, [idsKey, contentRef, emptyRef]);
}

export const MyBooks: React.FC = () => {
  const { t } = useTranslation();
  const { loans, isLoading } = useUser();
  const sortedBooks = loans
    ? sortBooksByLoanExpirationDate(loans.filter(isOnShelf))
    : [];
  const noBooks = sortedBooks.length === 0;
  const contentRef = React.useRef<HTMLDivElement>(null);
  const emptyRef = React.useRef<HTMLHeadingElement>(null);
  useFocusAfterRemoval(
    sortedBooks.map(book => book.id),
    contentRef,
    emptyRef
  );

  return (
    <AuthProtectedRoute>
      <div sx={{ flex: 1, pb: 4 }}>
        <Head>
          <title>{t("nav.myBooks", "My Books", { ns: "common" })}</title>
        </Head>

        <BreadcrumbBar
          currentLocation={t("nav.myBooks", "My Books", { ns: "common" })}
        />
        <PageTitle>{t("nav.myBooks", "My Books", { ns: "common" })}</PageTitle>
        <div ref={contentRef}>
          {noBooks && isLoading ? (
            <PageLoader />
          ) : noBooks ? (
            <Empty headingRef={emptyRef} />
          ) : (
            <LoansContent books={sortedBooks} />
          )}
        </div>
      </div>
    </AuthProtectedRoute>
  );
};

const LoansContent: React.FC<{ books: AnyBook[] }> = ({ books }) => {
  return (
    <React.Fragment>
      <BookList books={books} />
    </React.Fragment>
  );
};

const Empty: React.FC<{ headingRef: React.Ref<HTMLHeadingElement> }> = ({
  headingRef
}) => {
  const { t } = useTranslation();
  return (
    <>
      <div
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          px: [3, 5]
        }}
      >
        <H2 variant="text.headers.tertiary" ref={headingRef} tabIndex={-1}>
          {t(
            "myBooks.empty",
            "Your books will show up here when you have any loaned or on hold."
          )}
        </H2>
      </div>
    </>
  );
};

export default MyBooks;

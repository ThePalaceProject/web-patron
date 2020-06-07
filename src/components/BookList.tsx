/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { BookData, LaneData } from "opds-web-client/lib/interfaces";
import BreadcrumbBar from "./BreadcrumbBar";
import BookCover from "./BookCover";
import truncateString from "../utils/truncate";
import { getAuthors } from "../utils/book";
import Lane from "./Lane";
import Link from "./Link";
import DetailField from "./BookMetaDetail";
import useBorrow from "../hooks/useBorrow";
import Button from "./Button";
import LoadingIndicator from "./LoadingIndicator";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

/**
 * In a collection you can:
 *  - See lanes view
 *  - See List/Gallery view
 *    - Switch between list and gallery in this case
 */

const ListLoadingIndicator = () => (
  <div
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: 2,
      fontWeight: "heading",
      p: 3
    }}
  >
    <LoadingIndicator /> Loading more books...
  </div>
);

export const ListView: React.FC<{
  books: BookData[];
  breadcrumb?: React.ReactNode;
}> = ({ books, breadcrumb }) => {
  // this hook will refetch the page when we reach the bottom of the screen
  const { listRef, isFetchingPage } = useInfiniteScroll();

  return (
    <React.Fragment>
      <BreadcrumbBar>{breadcrumb}</BreadcrumbBar>
      <ul ref={listRef} sx={{ p: 0, m: 0 }} data-testid="listview-list">
        {books.map(book => (
          <BookListItem key={book.id} book={book} />
        ))}
      </ul>
      {isFetchingPage && <ListLoadingIndicator />}
    </React.Fragment>
  );
};

const BookListItem: React.FC<{ book: BookData }> = ({ book }) => {
  const {
    borrowOrReserve,
    label,
    isBorrowed,
    isReserved,
    isBorrowable
  } = useBorrow(book);
  // if there is no book url, it doesn't make sense to display it.
  if (!book.url) return null;
  return (
    <li
      sx={{
        listStyle: "none",
        border: "1px solid",
        borderColor: "primaries.dark",
        borderRadius: "card",
        height: 140,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: ["wrap", "nowrap"],
        p: 3,
        m: 3
      }}
      aria-label={`Book: ${book.title}`}
    >
      <div sx={{ mx: 1, flex: "0 1 40%", display: "flex" }}>
        <BookCover book={book} sx={{ width: 70, height: 105 }} />
        <div sx={{ ml: 3 }}>
          <Link bookUrl={book.url}>
            <Styled.h2 sx={{ my: 2, variant: "text.bookTitle" }}>
              {truncateString(book.title, 50, true)}
            </Styled.h2>
          </Link>
          <span sx={{ color: "primary", fontSize: 2 }}>
            {getAuthors(book, 2).join(", ")}
          </span>
        </div>
      </div>
      <div
        sx={{
          mx: 3,
          flex: "0 1 40%",
          display: "flex"
        }}
        aria-label="Book metadata"
      >
        <div>
          <DetailField heading="Publisher" details={book.publisher} />
          <DetailField heading="Published" details={book.published} />
          <DetailField
            heading="Categories"
            details={book.categories?.join(", ")}
          />
        </div>
      </div>
      <div
        sx={{
          mx: 3,
          flex: "0 1 20%",
          display: "flex",
          justifyContent: "flex-end"
        }}
      >
        <Button
          disabled={isBorrowed || isReserved || !isBorrowable}
          onClick={borrowOrReserve}
        >
          {label}
        </Button>
      </div>
    </li>
  );
};

export const LanesView: React.FC<{ lanes: LaneData[] }> = ({ lanes }) => {
  return (
    <React.Fragment>
      {lanes.map(lane => (
        <Lane key={lane.url} lane={lane} />
      ))}
    </React.Fragment>
  );
};

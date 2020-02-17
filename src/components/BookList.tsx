/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { BookData, LaneData } from "opds-web-client/lib/interfaces";
import BreadcrumbBar from "./BreadcrumbBar";
import useCatalogLink, { useGetCatalogLink } from "../hooks/useCatalogLink";
import BookCover from "./BookCover";
import truncateString from "../utils/truncate";
import { getAuthors } from "../utils/book";
import Lane from "./Lane";
import Link from "./Link";
import DetailField from "./BookMetaDetail";
import useBorrow from "../hooks/useBorrow";
import Button from "./Button";

/**
 * In a collection you can:
 *  - See lanes view
 *  - See List/Gallery view
 *    - Switch between list and gallery in this case
 */

export const GalleryView: React.FC<{ books: BookData[] }> = ({ books }) => {
  return (
    <div>
      <BreadcrumbBar>hi from bread</BreadcrumbBar>
      <ul
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "stretch",
          justifyContent: "center",
          p: 0,
          m: 0
        }}
      >
        {books.map(book => (
          <BookCover key={book.id} book={book} sx={{ my: 3, mx: 3 }} />
        ))}
      </ul>
    </div>
  );
};

export const ListView: React.FC<{ books: BookData[]; breadcrumb?: string }> = ({
  books,
  breadcrumb
}) => {
  return (
    <React.Fragment>
      <BreadcrumbBar>{breadcrumb}</BreadcrumbBar>
      <ul sx={{ p: 0, m: 0 }}>
        {books.map(book => (
          <BookListItem key={book.id} book={book} />
        ))}
      </ul>
    </React.Fragment>
  );
};

const BookListItem: React.FC<{ book: BookData }> = ({ book }) => {
  const { borrowOrReserve, isBorrowed, isReserved, isBorrowable } = useBorrow(
    book
  );
  console.log(book);
  const url = useCatalogLink(book.url);
  return (
    <li
      sx={{
        listStyle: "none",
        border: "1px solid",
        borderColor: "blues.dark",
        borderRadius: "card",
        height: 140,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: ["wrap", "nowrap"],
        p: 3,
        m: 3
      }}
    >
      <div sx={{ mx: 1, flex: "0 1 40%", display: "flex" }}>
        <Link to={url}>
          <BookCover book={book} sx={{ width: 70, height: 105 }} />
        </Link>
        <div sx={{ ml: 3 }}>
          <Link to={url}>
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
          // justifyContent: "center"
        }}
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
          {isBorrowed ? "Borrowed" : isReserved ? "On hold" : "Borrow"}
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

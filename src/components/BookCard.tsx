/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { BookData } from "opds-web-client/lib/interfaces";
import { getAuthors } from "../utils/book";
import Link from "./Link";
import BookCover from "./BookCover";
import truncateString from "../utils/truncate";
import Button from "./Button";
import useBorrow from "../hooks/useBorrow";
import { Text, H3 } from "./Text";

export const BOOK_WIDTH = 215;
const BOOK_HEIGHT = 330;

const BookCard = React.forwardRef<
  HTMLLIElement,
  { book: BookData; className?: string; showBorrowButton?: boolean }
>(({ book, className, showBorrowButton = false }, ref) => {
  const {
    borrowOrReserve,
    label,
    isBorrowed,
    isReserved,
    isBorrowable
  } = useBorrow(book);
  const authors = getAuthors(book, 2);

  // if the book url is undefined, there is no sense displaying it.
  if (!book.url) return null;
  return (
    <li
      className={className}
      ref={ref}
      sx={{
        listStyle: "none",
        display: "block",
        border: "solid",
        bg: "ui.white",
        borderRadius: "card",
        p: 3,
        flex: `0 0 ${BOOK_WIDTH}px`,
        height: BOOK_HEIGHT,
        // width: 215,
        mx: 2
      }}
    >
      <Link bookUrl={book.url}>
        <BookCover book={book} sx={{ mx: 40 - 16 }} />
        <H3 sx={{ m: 0, mt: 2, fontSize: 1 }}>
          {truncateString(book.title, 50, true)}
        </H3>
        <Text sx={{ color: "brand.secondary" }}>{authors.join(", ")}</Text>
        {showBorrowButton && (
          <Button
            disabled={isBorrowed || isReserved || !isBorrowable}
            onClick={borrowOrReserve}
            sx={{ mt: 3 }}
          >
            {label}
          </Button>
        )}
      </Link>
    </li>
  );
});

export default BookCard;

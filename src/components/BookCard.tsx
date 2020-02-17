/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { BookData } from "opds-web-client/lib/interfaces";
import useCatalogLink from "../hooks/useCatalogLink";
import { getAuthors } from "../utils/book";
import Link from "./Link";
import BookCover from "./BookCover";
import truncateString from "../utils/truncate";

export const BOOK_HEIGHT = 200;

const Book = React.forwardRef<
  HTMLLIElement,
  { book: BookData; className?: string }
>(({ book, className }, ref) => {
  const link = useCatalogLink(book.url);
  const authors = getAuthors(book, 2);
  return (
    <li
      className={className}
      ref={ref}
      sx={{
        listStyle: "none",
        display: "block",
        border: "1px solid",
        borderColor: "blues.dark",
        borderRadius: "card",
        py: 3,
        px: 2,
        flex: `0 0 ${BOOK_HEIGHT}px`,
        mx: 2,
        textAlign: "center"
      }}
    >
      <Link to={link}>
        <BookCover book={book} sx={{ mx: 4 }} />
        <Styled.h2
          sx={{
            variant: "text.bookTitle"
          }}
        >
          {truncateString(book.title, 50, true)}
        </Styled.h2>
        <span sx={{ color: "blues.primary" }}>{authors.join(", ")}</span>
      </Link>
    </li>
  );
});

export default Book;

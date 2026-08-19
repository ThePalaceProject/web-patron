import * as React from "react";
import { formatAuthorList, getAuthors, getMediumName } from "../utils/book";
import Link from "./Link";
import BookCover from "./BookCover";
import { truncateString } from "../utils/string";
import { H3, P } from "./Text";
import { AnyBook } from "interfaces";
import { useAppConfig } from "components/context/AppConfigContext";
import { useTranslation } from "next-i18next/pages";
import useLocale from "hooks/useLocale";

export const BOOK_WIDTH = 187;
export const BOOK_HEIGHT = 365;

const twoLines = 42;

const BookCard = React.forwardRef<
  HTMLLIElement,
  { book: AnyBook; className?: string }
>(({ book, className }, ref) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { showMedium } = useAppConfig();
  const authors = formatAuthorList(getAuthors(book, t, 2), locale);

  // if the book url is undefined, there is no sense displaying it.
  if (!book.url) return null;
  return (
    <li
      className={className}
      ref={ref}
      sx={{
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        flex: `0 0 ${BOOK_WIDTH}px`,
        height: BOOK_HEIGHT,
        mx: 2
      }}
    >
      <Link
        bookUrl={book.url}
        aria-label={t(
          "bookCard.ariaLabel",
          "{{title}} - {{medium}}, by {{authors}}",
          {
            title: book.title,
            medium: getMediumName(book, t),
            authors
          }
        )}
        sx={{ "&:hover": { textDecoration: "none" } }}
      >
        <BookCover book={book} showMedium={showMedium} />
        <div sx={{ flex: "1 1 auto" }} />
        <H3 sx={{ m: 0, mt: 1, fontSize: -1 }}>
          {truncateString(book.title, twoLines, false)}
        </H3>
        <P sx={{ fontSize: -1 }}>{truncateString(authors, twoLines, false)}</P>
      </Link>
    </li>
  );
});
BookCard.displayName = "BookCard";

export default BookCard;

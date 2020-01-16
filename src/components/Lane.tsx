/** @jsx jsx */
import { jsx, Styled, useThemeUI } from "theme-ui";
import * as React from "react";
import { LaneData, BookData } from "opds-web-client/lib/interfaces";
import BookCover from "./BookCover";
import truncateString from "../utils/truncate";
import Link from "./Link";
import useCatalogLink from "../hooks/useCatalogLink";
import ArrowRight from "../icons/ArrowRight";
import { Tabbable } from "reakit/Tabbable";

const BOOK_WIDTH = 200;
const BOOK_MARGIN = 2;

const Lane: React.FC<{ lane: LaneData; omitIds?: string[] }> = ({
  omitIds,
  lane: { title, books }
}) => {
  const filteredBooks = books.filter(book => {
    if (!omitIds?.includes(book.id)) return book;
  });

  /** Set up handlers for prev and next buttons */

  // for moving right/left
  const [scrollPosition, setScrollPosition] = React.useState(0);
  // we will need the theme to get the book margin and set increment
  const { theme } = useThemeUI();
  const increment = BOOK_WIDTH + theme.space[BOOK_MARGIN] * 2;
  const handleRightClick = () => {
    setScrollPosition(scrollPosition - increment);
  };
  const handleLeftClick = () => {
    setScrollPosition(scrollPosition + increment);
  };

  return (
    <div sx={{}}>
      <Styled.h3
        sx={{
          backgroundColor: "blues.dark",
          color: "white",
          m: 0,
          p: 2,
          textTransform: "uppercase"
        }}
      >
        {title}
      </Styled.h3>
      <div
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100vw",
          position: "relative"
        }}
      >
        <PrevNextButton isPrev onClick={handleLeftClick} />
        <div
          sx={{
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
            py: 3
          }}
        >
          <div
            sx={{
              display: "flex",
              transition: "transform 300ms ease 100ms",
              transform: `translateX(${scrollPosition}px)`
            }}
          >
            {filteredBooks.map(book => (
              <Book key={book.id} book={book} />
            ))}
          </div>
        </div>

        <PrevNextButton onClick={handleRightClick} />
      </div>
    </div>
  );
};

const Book: React.FC<{
  book: BookData;
}> = ({ book }) => {
  const link = useCatalogLink(book.url);
  return (
    <Link
      to={link}
      sx={{
        border: "1px solid",
        borderColor: "blues.dark",
        borderRadius: "card",
        py: 3,
        px: 2,
        flex: `0 0 ${BOOK_WIDTH}px`,
        mx: BOOK_MARGIN,
        textAlign: "center"
      }}
    >
      <BookCover book={book} sx={{ mx: 4 }} />
      <Styled.h2
        sx={{
          variant: "text.bookTitle",
          letterSpacing: 0.8,
          mb: 1
        }}
      >
        {truncateString(book.title, 50, true)}
      </Styled.h2>
      <span sx={{ color: "blues.primary" }}>{book.authors.join(", ")}</span>
    </Link>
  );
};

const PrevNextButton: React.FC<{ onClick: () => void; isPrev?: boolean }> = ({
  onClick,
  isPrev = false
}) => {
  return (
    <Tabbable
      as="div"
      sx={{
        /** the following will make this a semi transparent button */
        // position: "absolute",
        // top: 0,
        // height: "100%",
        // left: isPrev ? 0 : null,
        // right: isPrev ? null : 0,
        // zIndex: 2,
        // backgroundColor: "rgba(255,255,255,0.9)",
        // background:
        //   "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%);",
        // px: 4,

        buttonStyle: "none",
        backgroundColor: "white",
        fontSize: 60,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "blues.light"
        }
      }}
      onClick={onClick}
      role="button"
      aria-label="scroll right"
    >
      <ArrowRight
        sx={{
          fill: "blues.primary",
          transform: isPrev ? "rotate(180deg)" : null
        }}
      />
    </Tabbable>
  );
};

export default Lane;

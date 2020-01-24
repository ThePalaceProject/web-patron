/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { LaneData, BookData } from "opds-web-client/lib/interfaces";
import BookCover from "./BookCover";
import truncateString from "../utils/truncate";
import Link from "./Link";
import useCatalogLink from "../hooks/useCatalogLink";
import ArrowRight from "../icons/ArrowRight";
import { Tabbable } from "reakit/Tabbable";
import Button, { LinkButton } from "./Button";

type BookRefs = {
  [id: string]: React.RefObject<HTMLLIElement>;
};

/**
 * - scrolls automatically on button clicks
 * - allows the user to free scroll / swipe also
 */
const Lane: React.FC<{ lane: LaneData; omitIds?: string[] }> = ({
  omitIds,
  lane: { title, books, url }
}) => {
  const filteredBooks = books.filter(book => {
    if (!omitIds?.includes(book.id)) return book;
  });

  /** we will use state to determine which book should be in view */
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [isBrowserScrolling, setIsBrowserScrolling] = React.useState<boolean>(
    false
  );
  /** keep track of a ref for each book */
  const bookRefs: BookRefs = filteredBooks.reduce((acc, value) => {
    const ref = React.createRef<HTMLLIElement>();
    acc[value.id] = ref;
    return acc;
  }, {});
  // we need a ref to the UL element so we can scroll it
  const scrollContainer = React.useRef<HTMLUListElement | null>(null);

  const isAtIndexEnd = currentIndex === filteredBooks.length - 1;
  const isAtScrollEnd =
    scrollContainer.current &&
    scrollContainer.current.scrollLeft ===
      scrollContainer.current.scrollWidth - scrollContainer.current.offsetWidth;
  const isAtEnd = !!(isAtIndexEnd || isAtScrollEnd);
  const isAtStart = currentIndex === 0;

  /** Handlers for button clicks */
  const handleRightClick = () => {
    const nextIndex = currentIndex + 1;
    if (isAtEnd) return;
    scrollToBook(nextIndex);
  };
  const handleLeftClick = () => {
    const nextIndex = currentIndex - 1;
    if (isAtStart) return;
    scrollToBook(nextIndex);
  };

  // will be used to set a timeout when the browser is auto scrolling
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const browserScrollTime = 1000; // guess how long the browser takes to scroll

  const scrollToBook = (nextIndex: number) => {
    const nextBook = filteredBooks[nextIndex];
    const nextBookRef = bookRefs[nextBook.id];
    setCurrentIndex(nextIndex);
    const bookX = nextBookRef.current?.offsetLeft || 0;
    scrollContainer.current?.scrollTo({
      left: bookX,
      behavior: "smooth"
    });
    // allows us to bail out of handleScroll when the browser is autoscrolling
    setIsBrowserScrolling(true);
    // clear any old timeout and set a new one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsBrowserScrolling(false);
    }, browserScrollTime);
  };

  /**
   * Keep the currentIndex up to date when the user scrolls/swipes freely
   */
  const getBookWidth = () => {
    const firstBookId = filteredBooks[0].id;
    const firstBookRef = bookRefs[firstBookId];
    const firstBookWidth = firstBookRef.current?.offsetWidth || 0;
    return firstBookWidth;
  };
  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    /**
     * Bail out of this calculation if the browser is scrolling with
     * scrollTo
     */
    if (isBrowserScrolling) return;
    const position = e.currentTarget.scrollLeft;
    const bookWidth = getBookWidth();
    const currentBook = Math.floor(position / bookWidth);
    setCurrentIndex(currentBook);
  };

  const laneUrl = useCatalogLink(undefined, url);

  return (
    <div sx={{}}>
      <div
        sx={{
          backgroundColor: "blues.dark",
          color: "white",
          m: 0,
          p: 2,
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <Styled.h3 sx={{ m: 0 }}>{title}</Styled.h3>
        <LinkButton to={laneUrl} sx={{ fontSize: 1, fontWeight: 2 }}>
          View all {title}
        </LinkButton>
      </div>
      <div
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100vw",
          position: "relative"
        }}
      >
        <PrevNextButton isPrev onClick={handleLeftClick} disabled={isAtStart} />

        <ul
          ref={scrollContainer}
          sx={{
            p: 0,
            my: 2,
            display: "flex",
            transition: "transform 300ms ease 100ms",
            overflowX: "scroll",
            position: "relative",
            width: "100%"
          }}
          onScroll={handleScroll}
        >
          {filteredBooks.map(book => (
            <Book key={book.id} book={book} ref={bookRefs[book.id]} />
          ))}
        </ul>

        <PrevNextButton onClick={handleRightClick} disabled={isAtEnd} />
      </div>
    </div>
  );
};

const Book = React.forwardRef<HTMLLIElement, { book: BookData }>(
  ({ book }, ref) => {
    const link = useCatalogLink(book.url);
    return (
      <li
        ref={ref}
        sx={{
          listStyle: "none",
          display: "block",
          border: "1px solid",
          borderColor: "blues.dark",
          borderRadius: "card",
          py: 3,
          px: 2,
          flex: `0 0 ${200}px`,
          mx: 2,
          textAlign: "center"
        }}
      >
        <Link to={link} sx={{}}>
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
          <span sx={{ color: "blues.primary" }}>
            {book?.authors?.join(", ")}
          </span>
        </Link>
      </li>
    );
  }
);

const PrevNextButton: React.FC<{
  onClick: () => void;
  isPrev?: boolean;
  disabled: boolean;
}> = ({ onClick, isPrev = false, disabled }) => {
  return (
    <Tabbable
      as="div"
      sx={{
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
      disabled={disabled}
    >
      <ArrowRight
        sx={{
          fill: disabled ? "grey" : "blues.primary",
          transform: isPrev ? "rotate(180deg)" : ""
        }}
      />
    </Tabbable>
  );
};

export default Lane;

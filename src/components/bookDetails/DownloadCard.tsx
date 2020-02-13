/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { getAvailabilityString } from "./utils";
import { sidebarWidth } from "./index";
import { BookData, OpenAccessLinkType } from "opds-web-client/lib/interfaces";
import { typeMap } from "opds-web-client/lib/utils/file";
import useTypedSelector from "../../hooks/useTypedSelector";
import { RequiredKeys } from "src/interfaces";
import {
  bookIsBorrowed,
  bookIsOpenAccess,
  bookIsReserved,
  bookIsReady
} from "opds-web-client/lib/utils/book";
import Button from "../Button";
import { useActions } from "../context/ActionsContext";

// a simple typeguard
type OpenAccessBook = RequiredKeys<BookData, "openAccessLinks">;
function isOpenAccessBook(book: BookData): book is OpenAccessBook {
  return (book.openAccessLinks?.length ?? 0) > 0;
}
type BorrowableBook = RequiredKeys<BookData, "borrowUrl">;
function isBorrowableBook(book: BookData): book is BorrowableBook {
  return typeof book.borrowUrl === "string";
}

/**
 * This card will handle logic to download books. There are a few cases
 *  1.  It is open access, in which case show download button for different
 *      formats.
 *
 *  2.  It is not open-access. We need to first borrow the book then allow
 *      patrons to download in different formats.
 *
 *      - It is not borrowed
 *        - It is not on hold
 *          - It is available to be on hold
 *          - It is not available
 *        - It is on hold
 *      - It is borrowed
 *
 * Maybe this would be better as a state map... where you have an object that
 * maps states to a display?
 */
const FulfillmentCard: React.FC<{ book: BookData }> = ({ book }) => {
  /**
   * If there are openAccessLinks, we display those and nothing else.
   * Otherwise, patrons need to borrow the book before downloading.
   */
  if (isOpenAccessBook(book)) {
    return <DownloadCard book={book} />;
  }
  // if the book is borrowed already, show download options
  if (bookIsBorrowed(book)) {
    console.log("BORROWED. SHOW DL OPS");
    return null;
  }
  // if the book either on hold, available, or reservable
  if (isBorrowableBook(book)) {
    console.log("ABLE TO BE BORROWED");
    return <BorrowCard book={book} />;
  }
  // the book cannot be borrowed, something likely went wrong
  return null;
};

const BorrowCard: React.FC<{ book: BorrowableBook }> = ({ book }) => {
  const bookError = useTypedSelector(state => state.book?.error);
  const state = useTypedSelector(state => state);
  console.log(state);
  const errorMsg = bookError?.response
    ? // eslint-disable-next-line camelcase
      JSON.parse(bookError?.response)?.debug_message
    : null;
  const availability = getAvailabilityString(book);
  const { actions, dispatch } = useActions();
  const loansUrl = useTypedSelector(state => state.loans.url);

  /**
   * Book can either be available to borrow, available to reserve, or reserved
   */
  const isReserved = bookIsReserved(book);
  // if it is not reserved and not reservable, then it is borrowable
  const isReservable = !bookIsReady(book) && book.copies?.available === 0;

  const label = isReserved ? "Reserved" : isReservable ? "Reserve" : "Borrow";

  const borrowOrReserve = async () => {
    console.log("Borrowing", book.borrowUrl);
    const data = await dispatch(actions.updateBook(book.borrowUrl));
    // refetch the loans
    const fetchloans = await dispatch(actions.fetchLoans(loansUrl));
    // why isn't my view updating with info from redux?

    console.log(data, fetchloans);
  };
  return (
    <CardWrapper>
      <div
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          px: 2,
          py: 3
        }}
      >
        {availability}
        {errorMsg && <p sx={{ color: "warn" }}>Error: {errorMsg}</p>}
        <Button onClick={borrowOrReserve} disabled={isReserved} sx={{ my: 3 }}>
          {label}
        </Button>
      </div>
    </CardWrapper>
  );
};

const DownloadCard: React.FC<{
  book: OpenAccessBook;
}> = ({ book }) => {
  const { openAccessLinks, fulfillmentLinks } = book;

  //  const links = bookIsOpenAccess(book) ? openAccessLinks : fulfillmentLinks;

  const availability = getAvailabilityString(book);

  const firstType = openAccessLinks[0].type;
  const types: {
    [key in OpenAccessLinkType]?: string;
  } = openAccessLinks.reduce((acc, { url, type }) => {
    acc[type] = url;
    return acc;
  }, {});

  const [selectedType, setSelectedType] = React.useState<string>(firstType);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
  };

  return (
    <CardWrapper>
      <div
        sx={{
          px: 2,
          py: 3,
          borderBottom: "1px solid",
          borderColor: "blues.primary"
        }}
      >
        <span>TYPE</span>
        <select
          value={selectedType}
          onBlur={handleTypeChange}
          onChange={handleTypeChange}
        >
          {Object.keys(types).map(type => (
            <option key={types[type]}>{typeMap[type]?.name ?? type}</option>
          ))}
        </select>
      </div>
      <div
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <div sx={{ mb: 2, textAlign: "center" }}>{availability}</div>
        <Styled.a
          target="__blank"
          rel="noopener noreferrer"
          href={types[selectedType]}
          sx={{ variant: "buttons.accent", px: 2, py: 1 }}
        >
          Download
        </Styled.a>
      </div>
    </CardWrapper>
  );
};

const CardWrapper: React.FC = ({ children }) => {
  return (
    <div
      sx={{
        border: "1px solid",
        borderColor: "blues.primary",
        borderRadius: "card",
        maxWidth: sidebarWidth,
        m: 2
      }}
    >
      {children}
    </div>
  );
};

export default FulfillmentCard;

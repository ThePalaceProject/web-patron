/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { getAvailabilityString, getErrorMsg } from "./utils";
import { sidebarWidth } from "./index";
import {
  BookData,
  MediaType,
  MediaLink,
  FulfillmentLink
} from "opds-web-client/lib/interfaces";
import { typeMap } from "opds-web-client/lib/utils/file";
import useTypedSelector from "../../hooks/useTypedSelector";
import { RequiredKeys } from "src/interfaces";
import {
  bookIsBorrowed,
  bookIsOpenAccess,
  bookIsReserved,
  bookIsReady,
  bookIsBorrowable
} from "opds-web-client/lib/utils/book";
import Button from "../Button";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";
import useDownloadButton from "opds-web-client/lib/hooks/useDownloadButton";

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
  if (bookIsOpenAccess(book)) {
    const availability = getAvailabilityString(book);
    return (
      <DownloadCard
        links={book.openAccessLinks}
        availability={availability}
        title={book.title}
        isOpenAccess={true}
      />
    );
  }
  // if the book is borrowed already, show download options
  if (bookIsBorrowed(book)) {
    const availability = getAvailabilityString(book);
    return (
      <DownloadCard
        links={book.fulfillmentLinks}
        availability={availability}
        title={book.title}
      />
    );
  }
  // if the book either on hold, available, or reservable
  if (bookIsBorrowable(book)) {
    return <BorrowCard book={book} />;
  }
  // the book cannot be borrowed, something likely went wrong
  console.error("Something went wrong in the FulfillmentCard");
  return null;
};

/**
 *  Specifically handles the case where it has yet to be borrowed.
 */
const BorrowCard: React.FC<{ book: RequiredKeys<BookData, "borrowUrl"> }> = ({
  book
}) => {
  const bookError = useTypedSelector(state => state.book?.error);
  const errorMsg = getErrorMsg(bookError);
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
    await dispatch(actions.updateBook(book.borrowUrl));
    // refetch the loans
    if (loansUrl) {
      await dispatch(actions.fetchLoans(loansUrl));
    }
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

type MimetypeToLinkMap = {
  [key in MediaType]?: MediaLink | FulfillmentLink;
};
/**
 * Handles the case where it is ready for download either via openAccessLink or
 * via fulfillmentLink.
 */
const DownloadCard: React.FC<{
  links: MediaLink[] | FulfillmentLink[];
  availability: string;
  title: string;
  isOpenAccess?: boolean;
}> = ({ links, availability, title, isOpenAccess = false }) => {
  const linksByMimetype: MimetypeToLinkMap = {};
  links.forEach(link => (linksByMimetype[link.type] = link));

  const defaultType = links[0].type;
  const [selectedType, setSelectedType] = React.useState<MediaType>(
    defaultType
  );

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.currentTarget.value as MediaType);
  };

  const currentLink = linksByMimetype[selectedType];
  const downloadDetails = useDownloadButton(currentLink, title);

  if (!downloadDetails) return null;
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
          {Object.keys(linksByMimetype).map(mediaType => (
            <option key={mediaType}>
              {typeMap[mediaType]?.name ?? mediaType}
            </option>
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
        {isOpenAccess ? (
          <Styled.a
            target="__blank"
            rel="noopener noreferrer"
            href={linksByMimetype[selectedType]?.url}
            sx={{ variant: "buttons.accent", px: 2, py: 1 }}
          >
            Download
          </Styled.a>
        ) : (
          <Button onClick={downloadDetails.fulfill}>Download</Button>
        )}
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

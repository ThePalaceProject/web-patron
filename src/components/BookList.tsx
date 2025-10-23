/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, SxProp } from "theme-ui";
import * as React from "react";
import { truncateString, stripHTML } from "../utils/string";
import {
  bookIsBorrowable,
  bookIsFulfillable,
  bookIsReservable,
  bookIsReserved,
  bookIsOnHold,
  getAuthorsString
} from "../utils/book";
import Lane from "./Lane";
import Button from "./Button";
import LoadingIndicator from "./LoadingIndicator";
import { H2, P, ScreenReaderOnly, Text } from "./Text";
import BookCover from "./BookCover";
import BorrowOrReserve from "./BorrowOrReserve";
import { AnyBook, CollectionData, LaneData } from "interfaces";
import { fetchCollection } from "dataflow/opds1/fetch";
import useSWRInfinite from "swr/infinite";
import useUser from "components/context/UserContext";
import Stack from "components/Stack";
import CancelOrReturn from "components/CancelOrReturn";
import FulfillmentButton from "components/FulfillmentButton";
import {
  getFulfillmentFromLink,
  shouldRedirectToCompanionApp
} from "utils/fulfill";
import BookStatus from "components/BookStatus";
import Link from "./Link";
import { APP_CONFIG } from "utils/env";

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
    <LoadingIndicator /> Loading ...
  </div>
);

export const InfiniteBookList: React.FC<{ firstPageUrl: string }> = ({
  firstPageUrl
}) => {
  const { token } = useUser();
  const getKey = (pageIndex: number, previousData: CollectionData | null) => {
    // first page, no previous data
    if (pageIndex === 0) return [firstPageUrl, token];
    // reached the end
    if (!previousData?.nextPageUrl) return null;
    // otherwise return the next page url
    return [previousData.nextPageUrl, token];
  };
  const { data, size, error, setSize } = useSWRInfinite(
    getKey,
    fetchCollection
  );

  const isFetchingInitialData = !data && !error;
  const lastItem = data && data[data.length - 1];
  const hasMore = !!lastItem?.nextPageUrl;
  const isFetchingMore = !!(!error && hasMore && size > (data?.length ?? 0));
  const isFetching = isFetchingInitialData || isFetchingMore;

  // extract the books from the array of collections in data
  const books =
    data?.reduce<AnyBook[]>(
      (total, current) => [...total, ...(current.books ?? [])],
      []
    ) ?? [];

  return (
    <>
      <BookList books={books} />
      {isFetching ? (
        <ListLoadingIndicator />
      ) : hasMore ? (
        <div sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <Button
            size="lg"
            color="brand.primary"
            onClick={() => setSize(size => size + 1)}
            sx={{ maxWidth: 300 }}
          >
            View more
          </Button>
        </div>
      ) : null}
    </>
  );
};

export const BookList: React.FC<{
  books: AnyBook[];
}> = ({ books }) => {
  return (
    <ul sx={{ px: [3, 5] }} data-testid="listview-list">
      {books.map(book => (
        <BookListItem key={book.id} book={book} />
      ))}
    </ul>
  );
};

export const BookListItem: React.FC<{
  book: AnyBook;
}> = ({ book: collectionBook }) => {
  const { loans } = useUser();
  // if the book exists in loans, use that version
  const loanedBook = loans?.find(loan => loan.id === collectionBook.id);
  const book = loanedBook ?? collectionBook;

  // uses contributors if there are no authors
  const authors = getAuthorsString(book);

  return (
    <li
      sx={{
        listStyle: "none",
        borderBottom: "1px solid",
        borderColor: "ui.gray.light",
        py: 3
      }}
    >
      <Stack
        sx={{
          alignItems: "flex-start"
        }}
        spacing={3}
      >
        <Link
          bookUrl={book.url}
          aria-label={`View ${book.title}`}
          aria-hidden="true"
          tabIndex={-1}
          sx={{
            flex: ["0 0 100px", "0 0 100px", "0 0 148px"],
            height: [141, 141, 219]
          }}
        >
          <div
            sx={{
              flex: ["0 0 100px", "0 0 100px", "0 0 148px"],
              height: [141, 141, 219]
            }}
          >
            <BookCover book={book} showMedium={APP_CONFIG.showMedium} />
          </div>
        </Link>
        <Stack direction="column" sx={{ alignItems: "flex-start" }}>
          <div>
            <H2 sx={{ mb: 0, display: "inline" }}>
              <Link
                bookUrl={book.url}
                sx={{ variant: "text.link.bold", color: "brand.primary" }}
                aria-label={`View details for ${book.title}`}
              >
                <Metadata display="inline" heading="Title">
                  {truncateString(book.title, 50)}
                </Metadata>
              </Link>
              {book.subtitle && (
                <Text>: {truncateString(book.subtitle, 50)}</Text>
              )}
            </H2>
            <Metadata heading="Authors">{authors}</Metadata>
          </div>

          <BookStatus book={book} />
          <BookListCTA book={book} />
          <Description
            book={book}
            sx={{ display: ["none", "none", "block"] }}
          />
        </Stack>
      </Stack>
      <Description
        book={book}
        sx={{ display: ["block", "block", "none"], mt: 2 }}
      />
    </li>
  );
};

const Metadata: React.FC<{
  heading: string;
  variant?: string;
  display?: string;
  children: React.ReactNode;
}> = ({ heading, variant, children, display = "block" }) => {
  return (
    <P sx={{ margin: 0, variant, display }}>
      <ScreenReaderOnly>{heading} :</ScreenReaderOnly>
      {children}
    </P>
  );
};

const Description: React.FC<{
  book: AnyBook;
  className?: string;
}> = ({ book, className }) => {
  return (
    <div className={className}>
      <Metadata heading="Description" variant="text.body.italic">
        {truncateString(stripHTML(book.summary ?? ""), 280)}
      </Metadata>
    </div>
  );
};

const BookListCTA: React.FC<{ book: AnyBook }> = ({ book }) => {
  if (bookIsBorrowable(book)) {
    return <BorrowOrReserve url={book.borrowUrl} isBorrow />;
  }

  if (bookIsReservable(book)) {
    return <BorrowOrReserve url={book.reserveUrl} isBorrow={false} />;
  }

  if (bookIsOnHold(book)) {
    return <BorrowOrReserve url={book.borrowUrl} isBorrow />;
  }

  if (bookIsReserved(book)) {
    return (
      <CancelOrReturn
        url={book.revokeUrl}
        id={book.id}
        text="Cancel Reservation"
        loadingText="Cancelling..."
      />
    );
  }

  if (bookIsFulfillable(book)) {
    // we will show a fulfillment button if there is only one option
    // and we are not supposed to redirect the user to the companion app
    const showableLinks = book.fulfillmentLinks.filter(
      link => link.supportLevel === "show"
    );
    const shouldRedirectUser = shouldRedirectToCompanionApp(
      book.fulfillmentLinks
    );

    const showableFulfillments = showableLinks.map(getFulfillmentFromLink);
    const singleFulfillment =
      showableFulfillments.length === 1 ? showableFulfillments[0] : undefined;

    return (
      <>
        <CancelOrReturn
          url={book.revokeUrl}
          loadingText="Returning..."
          id={book.id}
          text="Return"
        />
        {singleFulfillment && !shouldRedirectUser && (
          <FulfillmentButton
            details={singleFulfillment}
            book={book}
            isPrimaryAction
          />
        )}
      </>
    );
  }

  return null;
};

export const LanesView: React.FC<{ lanes: LaneData[] }> = ({ lanes }) => {
  return (
    <ul sx={{ m: 0, p: 0 }}>
      {lanes.map(lane => (
        <Lane key={lane.url} lane={lane} />
      ))}
    </ul>
  );
};

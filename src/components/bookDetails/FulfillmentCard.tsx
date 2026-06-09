import * as React from "react";
import * as _ from "lodash";
import {
  bookIsBorrowable,
  bookIsReservable,
  bookIsReserved,
  bookIsOnHold,
  bookIsFulfillable
} from "utils/book";
import withErrorBoundary from "../ErrorBoundary";
import Stack from "components/Stack";
import { Text } from "components/Text";
import BorrowOrReserveOrPreview from "components/BorrowOrReserveOrPreview";
import CancelOrReturnOrPreview from "components/CancelOrReturnOrPreview";
import FulfillmentButton from "components/FulfillmentButton";
import {
  getFulfillmentsFromBook,
  shouldRedirectToCompanionApp
} from "utils/fulfill";
import BookStatus from "components/BookStatus";
import { AnyBook, FulfillableBook, FulfillmentLink } from "interfaces";
import { useAppConfig } from "components/context/AppConfigContext";

const FulfillmentCard: React.FC<{ book: AnyBook }> = ({ book }) => {
  return (
    <div
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        color: "ui.gray.extraDark"
      }}
    >
      <Stack direction="column" sx={{ my: 3, alignItems: "flex-start" }}>
        <BookStatus book={book} />
        <FulfillmentContent book={book} />
      </Stack>
    </div>
  );
};

const FulfillmentContent: React.FC<{
  book: AnyBook;
}> = ({ book }) => {
  if (bookIsBorrowable(book)) {
    return (
      <BorrowOrReserveOrPreview
        isBorrow
        borrowUrl={book.borrowUrl}
        previewUrl={book.previewUrl}
      />
    );
  }
  if (bookIsReservable(book)) {
    return (
      <BorrowOrReserveOrPreview
        isBorrow={false}
        borrowUrl={book.reserveUrl}
        previewUrl={book.previewUrl}
      />
    );
  }
  if (bookIsReserved(book)) {
    return (
      <CancelOrReturnOrPreview
        revokeUrl={book.revokeUrl}
        previewUrl={book.previewUrl}
        text="Cancel Reservation"
        loadingText="Cancelling..."
        id={book.id}
      />
    );
  }
  if (bookIsOnHold(book)) {
    return (
      <BorrowOrReserveOrPreview
        borrowUrl={book.borrowUrl}
        previewUrl={book.previewUrl}
        isBorrow
      />
    );
  }
  if (bookIsFulfillable(book)) {
    return <AccessCard links={book.fulfillmentLinks} book={book} />;
  }
  return (
    <Text>
      This title is not supported in this application, please try another.
    </Text>
  );
};

/**
 * Handles the case where it is ready for access either via openAccessLink or
 * via fulfillmentLink.
 */
const AccessCard: React.FC<{
  book: FulfillableBook;
  links: readonly FulfillmentLink[];
}> = ({ book, links }) => {
  const { companionApp } = useAppConfig();
  const fulfillments = getFulfillmentsFromBook(book);

  // visually prioritize internal and external readers (mirrors apps)
  const [webCatalogFulfillments, otherFulfillments] = _.partition(
    fulfillments,
    details =>
      ["read-online-internal", "read-online-external"].includes(details.type)
  );

  const isFulfillableInWebCatalog = webCatalogFulfillments.length > 0;
  const hasOtherFulfillments = otherFulfillments.length > 0;

  const redirectUser = shouldRedirectToCompanionApp(links);
  const action = book.format === "Audiobook" ? "listen to" : "read";
  const companionAppName =
    companionApp === "openebooks" ? "Open eBooks" : "the Palace App";

  const bookStatus = `${isFulfillableInWebCatalog ? "Also available" : "Available"} to ${action} in ${companionAppName}.`;

  return (
    <>
      {isFulfillableInWebCatalog ? (
        <Stack sx={{ flexWrap: "wrap" }}>
          {webCatalogFulfillments.map(details => (
            <FulfillmentButton
              isPrimaryAction
              key={details.id}
              details={details}
              book={book}
            />
          ))}
          <CancelOrReturnOrPreview
            revokeUrl={book.revokeUrl}
            loadingText="Returning..."
            id={book.id}
            text="Return"
          />
        </Stack>
      ) : (
        <CancelOrReturnOrPreview
          revokeUrl={book.revokeUrl}
          loadingText="Returning..."
          id={book.id}
          text="Return"
        />
      )}

      <Text variant="text.body.italic">{bookStatus}</Text>

      {hasOtherFulfillments && redirectUser && (
        <Text variant="text.body.italic">
          If you would rather read on your computer, you can:
        </Text>
      )}
      {hasOtherFulfillments && (
        <Stack sx={{ flexWrap: "wrap" }}>
          {otherFulfillments.map(details => (
            <FulfillmentButton
              key={details.id}
              details={details}
              book={book}
              isPrimaryAction={!redirectUser}
            />
          ))}
        </Stack>
      )}
    </>
  );
};

export default withErrorBoundary(FulfillmentCard);

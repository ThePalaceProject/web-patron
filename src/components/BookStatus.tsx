import * as React from "react";
import { MediumIcon } from "components/MediumIndicator";
import { AnyBook } from "interfaces";
import { availabilityString } from "utils/book";
import { ScreenReaderOnly, Text } from "components/Text";

const BookStatus: React.FC<{ book: AnyBook }> = ({ book }) => {
  const { status } = book;

  const str =
    status === "borrowable"
      ? "Available to borrow"
      : status === "reservable"
        ? "Unavailable"
        : status === "reserved"
          ? "Reserved"
          : status === "on-hold"
            ? "Ready to Borrow"
            : "Unsupported";

  return (
    <div>
      {status !== "fulfillable" && (
        <div sx={{ display: "flex", alignItems: "center" }}>
          <MediumIcon book={book} sx={{ mr: 1 }} />
          <Text variant="text.body.bold" sx={{ fontWeight: 600 }}>
            <ScreenReaderOnly>Book Status: </ScreenReaderOnly>
            {str}
          </Text>
        </div>
      )}
      <AvailabilityString book={book} />
    </div>
  );
};

const AvailabilityString: React.FC<{ book: AnyBook }> = ({ book }) => {
  const str = availabilityString(book);
  if (!str) return null;
  return (
    <Text
      variant="text.body.italic"
      sx={{ fontSize: "-1", color: "ui.gray.dark", my: 1 }}
    >
      <ScreenReaderOnly>Book Availability: </ScreenReaderOnly>
      {str}
    </Text>
  );
};

export default BookStatus;

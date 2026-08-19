import * as React from "react";
import { MediumIcon } from "components/MediumIndicator";
import { AnyBook } from "interfaces";
import { availabilityString } from "utils/book";
import { ScreenReaderOnly, Text } from "components/Text";
import { useTranslation } from "next-i18next/pages";

const BookStatus: React.FC<{ book: AnyBook }> = ({ book }) => {
  const { t } = useTranslation();
  const { status } = book;

  const unfillableReason =
    status === "borrowable"
      ? t("bookStatus.availableToBorrow", "Available to borrow")
      : status === "reservable"
        ? t("bookStatus.unavailable", "Unavailable")
        : status === "reserved"
          ? t("bookStatus.reserved", "Reserved")
          : status === "on-hold"
            ? t("bookStatus.readyToBorrow", "Ready to Borrow")
            : t("bookStatus.unsupported", "Unsupported");

  return (
    <div>
      {status !== "fulfillable" && (
        <div sx={{ display: "flex", alignItems: "center" }}>
          <MediumIcon book={book} sx={{ mr: 1 }} />
          <Text variant="text.body.bold" sx={{ fontWeight: 600 }}>
            <ScreenReaderOnly>
              {t("bookStatus.status", "Book Status:")}{" "}
            </ScreenReaderOnly>
            {unfillableReason}
          </Text>
        </div>
      )}
      <AvailabilityString book={book} />
    </div>
  );
};

const AvailabilityString: React.FC<{ book: AnyBook }> = ({ book }) => {
  const { t } = useTranslation();
  const str = availabilityString(book, t);
  if (!str) return null;
  return (
    <Text
      variant="text.body.italic"
      sx={{ fontSize: "-1", color: "ui.gray.dark", my: 1 }}
    >
      <ScreenReaderOnly>
        {t("bookStatus.availability", "Book Availability:")}{" "}
      </ScreenReaderOnly>
      {str}
    </Text>
  );
};

export default BookStatus;

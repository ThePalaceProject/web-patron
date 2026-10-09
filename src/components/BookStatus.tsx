import * as React from "react";
import { MediumIcon } from "components/MediumIndicator";
import { AnyBook } from "interfaces";
import { AvailabilityPlacement, availabilityString } from "utils/book";
import { ScreenReaderOnly, Text } from "components/Text";
import { TFunction, useTranslation } from "next-i18next/pages";
import { Language } from "utils/i18n";
import useLocale from "hooks/useLocale";

const BookStatus: React.FC<{
  book: AnyBook;
  placement: AvailabilityPlacement;
}> = ({ book, placement }) => {
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
      <AvailabilityString book={book} placement={placement} />
    </div>
  );
};

const AvailabilityString: React.FC<{
  book: AnyBook;
  placement: AvailabilityPlacement;
}> = ({ book, placement }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const str = availabilityString(book, t, locale, placement);
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

/**
 * What a screen reader announces for a book's availability,
 * e.g. the loan end date announced after a borrow.
 */
export function availabilityAnnouncement(
  book: AnyBook,
  t: TFunction,
  locale: Language,
  placement: AvailabilityPlacement
): string | null {
  const str = availabilityString(book, t, locale, placement);
  if (!str) return null;
  return `${t("bookStatus.availability", "Book Availability:")} ${str}`;
}

export default BookStatus;

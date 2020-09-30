/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useBorrow from "hooks/useBorrow";
import Button from "./Button";
import { Text } from "./Text";
import { BookData, MediaLink } from "interfaces";

const BorrowOrReserve: React.FC<{
  book: BookData;
  isBorrow: boolean;
  borrowLink: MediaLink;
}> = ({ book, isBorrow, borrowLink }) => {
  const {
    isLoading,
    loadingText,
    buttonLabel,
    borrowOrReserve,
    error
  } = useBorrow(book, isBorrow, borrowLink);
  return (
    <>
      <Button
        size="lg"
        onClick={() => borrowOrReserve(borrowLink.url)}
        loading={isLoading}
        loadingText={loadingText}
      >
        <Text variant="text.body.bold">{buttonLabel}</Text>
      </Button>
      {error && <Text sx={{ color: "ui.error" }}>Error: {error}</Text>}
    </>
  );
};

export default BorrowOrReserve;

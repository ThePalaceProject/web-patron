import * as React from "react";
import { Text } from "./Text";
import { bookMediumMap, getMedium } from "utils/book";
import { AnyBook, BookMediumName } from "interfaces";
import { Badge } from "theme-ui";

const MediumIndicator: React.FC<{ book: AnyBook; className?: string }> = ({
  book,
  className
}) => {
  const medium = getMedium(book);

  if (Object.keys(bookMediumMap).indexOf(medium) === -1) return null;
  if (medium === "") return null;
  const mediumInfo = bookMediumMap[medium];
  return (
    <Text sx={{ display: "flex", alignItems: "center" }} className={className}>
      <Badge sx={badgeStyleProps(mediumInfo.name)} mr={2}>
        <MediumIcon book={book} />
      </Badge>
      {mediumInfo.name}
    </Text>
  );
};

export default MediumIndicator;

export const MediumIcon: React.FC<{ book: AnyBook; className?: string }> = ({
  book,
  className,
  ...rest
}) => {
  const medium = getMedium(book);

  if (Object.keys(bookMediumMap).indexOf(medium) === -1) return null;
  if (medium === "") return null;
  const mediumInfo = bookMediumMap[medium];
  const MediumSvg = mediumInfo.icon;
  return MediumSvg ? (
    <MediumSvg aria-hidden="true" className={className} {...rest} />
  ) : null;
};

const badgeStyleProps = (mediumName: BookMediumName) => {
  switch (mediumName) {
    case "Audiobook": {
      return {
        background: "ui.blue.light",
        color: "ui.white"
      };
    }

    case "Book":
    case "eBook": {
      return {
        background: "ui.green.success",
        color: "ui.white"
      };
    }

    default:
      throw new Error(`You chose an unimplemented Medium Icon: ${mediumName}`);
  }
};

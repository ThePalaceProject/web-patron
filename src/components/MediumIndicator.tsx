import * as React from "react";
import { Text } from "./Text";
import { bookMediumMap, getMedium, translateMedium } from "utils/book";
import { AnyBook, BookMediumVariant } from "interfaces";
import { Badge } from "theme-ui";
import { useTranslation } from "next-i18next/pages";

const MediumIndicator: React.FC<{ book: AnyBook; className?: string }> = ({
  book,
  className
}) => {
  const { t } = useTranslation();
  const medium = getMedium(book);

  if (Object.keys(bookMediumMap).indexOf(medium) === -1) return null;
  if (medium === "") return null;
  const mediumInfo = bookMediumMap[medium];
  return (
    <Text sx={{ display: "flex", alignItems: "center" }} className={className}>
      <Badge sx={badgeStyleProps(mediumInfo.variant)} mr={2}>
        <MediumIcon book={book} />
      </Badge>
      {translateMedium(medium, t)}
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

const badgeStyleProps = (variant: BookMediumVariant) => {
  switch (variant) {
    case "audiobook": {
      return {
        background: "ui.blue.light",
        color: "ui.white"
      };
    }

    case "book": {
      return {
        background: "ui.green.success",
        color: "ui.white"
      };
    }

    default:
      throw new Error(`You chose an unimplemented Medium Icon: ${variant}`);
  }
};

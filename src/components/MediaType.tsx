/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { BookData } from "opds-web-client/lib/interfaces";
import { Text } from "./Text";
import { getMedium } from "opds-web-client/lib/utils/book";
import { bookMediumMap } from "utils/book";

const MediaTypeIndicator: React.FC<{ book: BookData; className?: string }> = ({
  book,
  className
}) => {
  const medium = getMedium(book);

  if (Object.keys(bookMediumMap).indexOf(medium) === -1) return null;
  const mediumInfo = bookMediumMap[medium];
  const MediumSvg = mediumInfo.icon;
  return (
    <Text sx={{ display: "flex", alignItems: "center" }} className={className}>
      {MediumSvg && <MediumSvg sx={{ mr: 1 }} />}
      {mediumInfo.name}
    </Text>
  );
};

export default MediaTypeIndicator;

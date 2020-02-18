/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import DefaulBookCover from "opds-web-client/lib/components/BookCover";
import { BookData } from "opds-web-client/lib/interfaces";
import { AspectRatio, AspectImage } from "@theme-ui/components";

/**
 * This is meant to be a book cover. Primarily the image and styling,
 * along with possibly extending it to lazy load the images in the future.
 */

const BookCover: React.FC<{ book: BookData; className?: string }> = ({
  book,
  className
}) => {
  const { imageUrl } = book;
  return (
    <div
      className={className}
      sx={{
        border: "1px solid",
        borderColor: "primary",
        borderRadius: 3,
        backgroundColor: "primaries.light",
        overflow: "hidden"
      }}
    >
      <AspectImage
        ratio={2 / 3}
        alt="Book Cover"
        src={imageUrl}
        role="presentation"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%"
        }}
      />
    </div>
  );
};

export default BookCover;

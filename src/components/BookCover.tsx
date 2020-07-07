/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { BookData } from "opds-web-client/lib/interfaces";
import { AspectImage } from "@theme-ui/components";

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
        borderRadius: 3,
        backgroundColor: "primaries.light",
        overflow: "hidden",
        position: "relative"
      }}
      aria-label={`Cover of book: ${book.title}`}
      role="img"
    >
      <AspectImage
        ratio={2 / 3}
        alt={`Cover of book: ${book.title}`}
        src={imageUrl}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          "::before": {
            backgroundColor: "grey.extraLight",
            content: '"Book cover image failed to load."',
            p: 1,
            position: "absolute",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%"
          }
        }}
      />
    </div>
  );
};

export default BookCover;

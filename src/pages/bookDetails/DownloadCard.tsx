/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { getAvailabilityString } from "./utils";
import Button, { LinkButton } from "../../components/Button";
import { sidebarWidth } from "./index";
import { BookData } from "opds-web-client/lib/interfaces";
import download from "downloadjs";
import { link } from "fs";

/**
 * This card will handle logic to download books. There are a few cases
 *  1.  It is open access, in which case show download button for different
 *      formats.
 *
 *  2.  It is not open-access. We need to first borrow the book then allow
 *      patrons to download in different formats.
 *
 *      - It is not borrowed
 *        - It is not on hold
 *          - It is available to be on hold
 *          - It is not available
 *        - It is on hold
 *      - It is borrowed
 */
const DownloadCard: React.FC<{ className?: string; book: BookData }> = ({
  className,
  book
}) => {
  const availability = getAvailabilityString(book);
  /**
   * Let's assume this is an open access book for now and get the different download
   * types. You need to have a current type selected in state
   */
  const { openAccessLinks } = book;

  if (!openAccessLinks) throw new Error("No open access links provided");

  const firstType = openAccessLinks?.[0].type;
  const types = openAccessLinks?.reduce((acc, { url, type }) => {
    acc[type] = url;
    return acc;
  }, {});

  const [selectedType, setSelectedType] = React.useState(types[firstType]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
  };

  /**
   * Check if indirect or direct
   *    - call fulfill with the url
   *    - download the returned blob
   */
  // const handleDownload = () => {};

  console.log(book);
  return (
    <div
      sx={{
        border: "1px solid",
        borderColor: "blues.primary",
        borderRadius: "card",
        maxWidth: sidebarWidth
      }}
      className={className}
    >
      <div
        sx={{
          px: 2,
          py: 3,
          borderBottom: "1px solid",
          borderColor: "blues.primary"
        }}
      >
        <span>TYPE</span>
        <select
          value={selectedType}
          onBlur={handleTypeChange}
          onChange={handleTypeChange}
        >
          {openAccessLinks.map(({ url, type }) => (
            <option key={url}>{type}</option>
          ))}
        </select>
      </div>
      <div
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <div sx={{ mb: 2, textAlign: "center" }}>{availability}</div>
        <Styled.a sx={{ variant: "buttons.accent" }} as="a">
          Download
        </Styled.a>
      </div>
    </div>
  );
};

export default DownloadCard;

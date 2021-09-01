/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import SvgIosBadge from "icons/IosBadge";

const IosBadge = (props: React.ComponentProps<"a">) => {
  return (
    <a
      rel="noopener noreferrer"
      target="__blank"
      // TODO: Replace with correct URL when Palace is in the App Store.
      href="https://apps.apple.com/us/app/simplye/id1046583900"
      aria-label="Download Palace on the Apple App Store"
      sx={{ display: "block" }}
      {...props}
    >
      <SvgIosBadge />
    </a>
  );
};
export default IosBadge;

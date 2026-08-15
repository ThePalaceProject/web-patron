import * as React from "react";
import SvgIosBadge from "icons/IosBadge";
import { useTranslation } from "next-i18next/pages";

const IosBadge = (props: React.ComponentProps<"a">) => {
  const { t } = useTranslation();
  return (
    <a
      rel="noopener noreferrer"
      target="__blank"
      href="https://apps.apple.com/us/app/the-palace-project/id1574359693"
      aria-label={t(
        "iosBadge.download",
        "Download Palace on the Apple App Store"
      )}
      sx={{ display: "block" }}
      {...props}
    >
      <SvgIosBadge />
    </a>
  );
};
export default IosBadge;

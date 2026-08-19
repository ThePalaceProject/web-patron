import { useTranslation } from "next-i18next/pages";
import * as React from "react";

const GooglePlayBadge = (props: React.ComponentProps<"a">) => {
  const { t } = useTranslation();
  return (
    <a
      rel="noopener noreferrer"
      target="__blank"
      aria-label={t(
        "googlePlayBadge.download",
        "Download Palace on the Google Play Store"
      )}
      // TODO: Replace with correct URL when Palace is in the Play Store.
      href="https://play.google.com/store/apps/details?id=org.thepalaceproject.palace&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
      sx={{ display: "block" }}
      {...props}
    >
      <img
        alt={t("googlePlayBadge.getOnGooglePlay", "Get it on Google Play")}
        sx={{ width: "100%" }}
        src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
      />
    </a>
  );
};
export default GooglePlayBadge;

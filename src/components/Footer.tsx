import * as React from "react";
import ExternalLink from "./ExternalLink";
import useLibraryContext from "./context/LibraryContext";
import List, { ListItem } from "./List";
import { H2, Text } from "./Text";
import { NavButton } from "./Button";
import SvgPhone from "icons/Phone";
import IosBadge from "./storeBadges/IosBadge";
import GooglePlayBadge from "./storeBadges/GooglePlayBadge";
import { useAppConfig } from "components/context/AppConfigContext";
import { useTranslation } from "next-i18next/pages";

const Footer: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation();
  const { companionApp } = useAppConfig();
  const library = useLibraryContext();
  const {
    helpEmail,
    helpWebsite,
    privacyPolicy,
    tos,
    about,
    registration,
    libraryWebsite
  } = library.libraryLinks;
  const title = library.catalogName;

  return (
    <footer
      sx={{
        bg: "ui.gray.extraLight",
        px: [3, 5],
        pb: 7,
        display: "flex",
        flexWrap: "wrap"
      }}
      className={className}
    >
      <div sx={{ flex: "0 0 auto", mt: 5, mr: 5 }}>
        <H2 variant="text.headers.tertiary" sx={{ mt: 0, maxWidth: "100%" }}>
          {title}
        </H2>
        <FooterList>
          {libraryWebsite && (
            <ListItem>
              <FooterExternalLink href={libraryWebsite.href}>
                {t("footer.libraryHomepage", "Library Homepage")}
              </FooterExternalLink>
            </ListItem>
          )}
          <ListItem>
            <NavButton variant="link" href="/loans" color="ui.black">
              {t("nav.myBooks", "My Books", { ns: "common" })}
            </NavButton>
          </ListItem>
          <ListItem>
            {registration && (
              <FooterExternalLink href={registration.href}>
                {t("footer.needLibraryCardQuestion", "Need a library card?")}
              </FooterExternalLink>
            )}
          </ListItem>
          {privacyPolicy && (
            <ListItem>
              <FooterExternalLink href={privacyPolicy.href}>
                {t("footer.privacyPolicy", "Privacy")}
              </FooterExternalLink>
            </ListItem>
          )}
          {tos && (
            <ListItem>
              <FooterExternalLink href={tos.href}>
                {t("footer.termsOfUse", "Terms of Use")}
              </FooterExternalLink>
            </ListItem>
          )}
          {about && (
            <ListItem>
              <FooterExternalLink href={about.href}>
                {t("footer.about", "About")}
              </FooterExternalLink>
            </ListItem>
          )}
        </FooterList>
      </div>
      <div sx={{ flex: "0 0 auto", mt: 5, mr: [3, 5] }}>
        <H2 variant="text.headers.tertiary" sx={{ mt: 0 }}>
          {t("footer.patronSupport", "Patron Support")}
        </H2>
        <FooterList>
          {helpEmail && (
            <ListItem>
              <FooterExternalLink href={helpEmail.href}>
                {t("footer.emailSupport", "Email Support")}
              </FooterExternalLink>
            </ListItem>
          )}
          {helpWebsite && (
            <ListItem>
              <FooterExternalLink href={helpWebsite.href}>
                {t("footer.helpWebsite", "Help Website")}
              </FooterExternalLink>
            </ListItem>
          )}
        </FooterList>
      </div>
      <div sx={{ flex: "1 1 0" }} />
      {companionApp === "simplye" && <DownloadSimplyECallout />}
    </footer>
  );
};

const DownloadSimplyECallout = () => {
  const { t } = useTranslation();
  return (
    <div sx={{ maxWidth: 300, flex: "0 1 auto", mt: 5 }}>
      <H2
        variant="text.headers.tertiary"
        sx={{ mt: 0, display: "flex", alignItems: "center" }}
      >
        <SvgPhone sx={{ mr: 1 }} />
        {t("nav.downloadPalace", "Download Palace", { ns: "common" })}
      </H2>
      <Text>
        {t(
          "footer.mobileAppsCallout",
          "Our mobile app lets you browse, borrow and read from our whole collection of ebooks and audiobooks right on your phone!"
        )}
      </Text>
      <div sx={{ width: "75%", overflow: "hidden", ml: -3 }}>
        <IosBadge sx={{ p: 3, pb: 0 }} />
        <GooglePlayBadge />
      </div>
    </div>
  );
};

const FooterList = (props: React.ComponentProps<typeof List>) => (
  <List
    sx={{
      "&>li": {
        my: 2
      }
    }}
    {...props}
  />
);

const FooterExternalLink: React.FC<React.HTMLProps<HTMLAnchorElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <ExternalLink sx={{ color: "ui.black" }} className={className} {...props}>
      {children}
    </ExternalLink>
  );
};

export default Footer;

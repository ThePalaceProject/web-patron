/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import ExternalLink from "./ExternalLink";
import useTypedSelector from "../hooks/useTypedSelector";
import { State } from "opds-web-client/lib/state";
import { LinkData } from "opds-web-client/lib/interfaces";

const labelMap = {
  about: "About",
  "terms-of-service": "Terms of Service",
  "privacy-policy": "Privacy Policy",
  copyright: "Copyright"
};

const getHelpLinkLabel = (link: LinkData): string => {
  if (typeof link.text === "string") return link.text;
  if (link.url.includes("mailto:")) {
    return "Email Support";
  }
  return link.url;
};

const Footer: React.FC<{ className?: string }> = ({ className }) => {
  const links = useTypedSelector(state => state?.collection?.data?.links ?? []);
  const title = useTypedSelector(
    state => state?.collection?.data?.title ?? "Library"
  );
  const helpLinks = links.filter(link => link.type === "help");

  return (
    <footer
      sx={{ backgroundColor: "primaries.dark", color: "white" }}
      className={className}
    >
      <div
        sx={{ display: "flex", alignItems: "flex-start", letterSpacing: 0.9 }}
      >
        <div sx={{ m: 4 }}>
          <Styled.h5 sx={{ m: 0 }}>{title}</Styled.h5>
        </div>
        <div sx={{ m: 4, mb: 2 }}>
          <Styled.h5 sx={{ m: 0 }}>Patron Support</Styled.h5>
          {helpLinks.map(link => (
            <FooterExternalLink
              sx={{ display: "block" }}
              key={`${link.url}${link.type}${link.text}`}
              href={link.url}
            >
              {getHelpLinkLabel(link)}
            </FooterExternalLink>
          ))}
        </div>
      </div>
      <div sx={{ mx: 4, my: 2, fontSize: 0 }}>
        <span sx={{ mr: 2 }}>Copyright</span>
        <FooterExternalLink>Privacy</FooterExternalLink>
      </div>
    </footer>
  );
};

const FooterExternalLink: React.FC<React.HTMLProps<HTMLAnchorElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <ExternalLink
      sx={{ color: "primaries.medium", textDecoration: "none" }}
      className={className}
      {...props}
    >
      {children}
    </ExternalLink>
  );
};

export default Footer;

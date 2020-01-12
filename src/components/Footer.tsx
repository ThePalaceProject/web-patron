/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import ExternalLink from "./ExternalLink";
import useTypedSelector from "../hooks/useTypedSelector";

const labelMap = {
  about: "About",
  "terms-of-service": "Terms of Service",
  "privacy-policy": "Privacy Policy",
  copyright: "Copyright"
};

const Footer: React.FC<{ className?: string }> = ({ className }) => {
  const links = useTypedSelector(state => state?.collection?.data?.links ?? []);
  const title = useTypedSelector(
    state => state?.collection?.data?.title ?? "Library"
  );

  const filteredLinks = links.filter(link => {
    if (typeof labelMap[link.type] === "string") {
      return link;
    }
  });

  return (
    <footer
      sx={{ backgroundColor: "blues.dark", color: "white" }}
      className={className}
    >
      <div
        sx={{ display: "flex", alignItems: "flex-start", letterSpacing: 0.9 }}
      >
        <div sx={{ m: 4 }}>
          <Styled.h5 sx={{ m: 0 }}>{title}</Styled.h5>
          {links.map(link => (
            <FooterExternalLink
              key={`${link.url}${link.type}${link.text}`}
              href={link.url}
            >
              {labelMap[link.type]}
            </FooterExternalLink>
          ))}
        </div>
        <div sx={{ m: 4 }}>
          <Styled.h5 sx={{ m: 0 }}>Patron Support</Styled.h5>
          <FooterExternalLink>Email</FooterExternalLink>
          <FooterExternalLink>Link</FooterExternalLink>
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
      sx={{ color: "blues.medium", textDecoration: "none" }}
      className={className}
      {...props}
    >
      {children}
    </ExternalLink>
  );
};

export default Footer;

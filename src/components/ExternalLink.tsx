/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

const ExternalLink: React.FC<React.HTMLProps<HTMLAnchorElement>> = ({
  children,
  ...props
}) => (
  <a
    sx={{ textDecoration: "underline" }}
    target="__blank"
    rel="noopener noreferrer"
    {...props}
  >
    {children}
  </a>
);

export default ExternalLink;

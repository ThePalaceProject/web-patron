/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { VisuallyHidden } from "reakit";

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
    <VisuallyHidden>(Opens in a new tab)</VisuallyHidden>
  </a>
);

export default ExternalLink;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as React from "react";
import { VisuallyHidden } from "@ariakit/react";
import { AnchorButton } from "./Button";

const ExternalLink: React.FC<React.ComponentPropsWithoutRef<"a">> = ({
  children,
  ...props
}) => (
  <AnchorButton
    variant="link"
    target="__blank"
    rel="noopener noreferrer"
    {...props}
  >
    {children}
    <VisuallyHidden>(Opens in a new tab)</VisuallyHidden>
  </AnchorButton>
);

export default ExternalLink;

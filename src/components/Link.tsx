/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { Link as BaseLink } from "react-router-dom";

type LinkProps = React.ComponentProps<typeof BaseLink>;

/**
 * Extends the react router link to add some styles
 */
function Link(props: LinkProps) {
  return <BaseLink sx={{ textDecoration: "none" }} {...props} />;
}

export default Link;

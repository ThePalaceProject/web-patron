/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { H1 } from "./Text";

const PageTitle: React.FC = ({ children }) => {
  return <H1 sx={{ px: 5, my: 4 }}>{children}</H1>;
};

export default PageTitle;

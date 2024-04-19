/** @jsxRuntime classic */
/** @jsx jsx */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { jsx } from "theme-ui";
import * as React from "react";

const List: React.FC<React.ComponentProps<"ul">> = props => {
  return <ul sx={{ m: 0, p: 0 }} {...props} />;
};

export const ListItem: React.FC<React.ComponentProps<"li">> = props => {
  return <li sx={{ listStyle: "none" }} {...props} />;
};

export default List;

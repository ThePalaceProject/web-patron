/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { H1 } from "./Text";
import Stack from "./Stack";
import Select from "./Select";

const PageTitle: React.FC = ({ children }) => {
  return (
    <Stack
      direction="row"
      sx={{
        px: 5,
        my: 4,
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <H1>{children}</H1>
      <Select>
        <option>hi</option>
      </Select>
    </Stack>
  );
};

export default PageTitle;

/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";

const MyBooks = () => {
  return (
    <div
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Styled.h3 sx={{ color: "primaries.medium" }}>
        My books page (in progress).
      </Styled.h3>
    </div>
  );
};

export default MyBooks;

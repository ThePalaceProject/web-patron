/** @jsx jsx */
import { jsx, Theme } from "theme-ui";
import * as React from "react";
import { Global } from "@emotion/core";

export default () => (
  <Global
    styles={(theme: Theme) => ({
      body: {
        margin: 0
      }
    })}
  />
);

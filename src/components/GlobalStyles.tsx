/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Theme } from "theme-ui";
import * as React from "react";
import { Global, Interpolation } from "@emotion/core";

const GlobalStyles: React.FC = () => (
  <Global
    styles={(_theme: Theme): Interpolation => ({
      body: {
        margin: 0
      }
    })}
  />
);

export default GlobalStyles;

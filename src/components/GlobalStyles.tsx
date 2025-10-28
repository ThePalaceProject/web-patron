import { Theme } from "theme-ui";
import * as React from "react";
import { Global, Interpolation } from "@emotion/react";

const GlobalStyles: React.FC = () => (
  <Global
    styles={(_theme: Theme): Interpolation<Theme> => ({
      body: {
        margin: 0
      }
    })}
  />
);

export default GlobalStyles;

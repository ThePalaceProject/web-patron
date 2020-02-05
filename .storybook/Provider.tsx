/** @jsx jsx */
import { jsx, ThemeProvider, Styled } from "theme-ui";
import * as React from "react";
import AppContextProvider from "../src/components/context/ContextProvider";
import { shortenUrls } from "../src/utils/env";
import { libraryData } from "../src/__tests__/fixtures/library";
import { DecoratorFn } from "@storybook/react";
import { BrowserRouter } from "react-router-dom";
import theme from "../src/theme";

/**
 * This provides all basic context for the app in storybook
 */
const providerDecorator: DecoratorFn = storyFn => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Styled.root>
          <AppContextProvider
            library={libraryData}
            shortenUrls={shortenUrls}
            // initialState={null}
          >
            {storyFn()}
          </AppContextProvider>
        </Styled.root>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default providerDecorator;

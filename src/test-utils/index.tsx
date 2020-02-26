import * as React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "theme-ui";
import theme from "../theme";
import ContextProvider from "../components/context/ContextProvider";
import Adapter from "enzyme-adapter-react-16";
import { configure } from "enzyme";
import library from "./fixtures/library";
import { MemoryRouter } from "react-router-dom";

// our fixtures
import * as fixtures from "./fixtures";
import { State } from "opds-web-client/lib/state";
import { LibraryData } from "interfaces";
export { fixtures };

configure({ adapter: new Adapter() });

type CustomRenderOptions = Parameters<typeof render>[1] & {
  route?: string;
  initialState?: State;
  library?: LibraryData;
};
const customRender = (ui: any, options?: CustomRenderOptions) => {
  const AllTheProviders = ({ children }) => {
    return (
      <MemoryRouter initialEntries={[options?.route ?? "/"]}>
        <ThemeProvider theme={theme}>
          <ContextProvider
            library={options?.library ?? library}
            shortenUrls
            helmetContext={{}}
            initialState={options?.initialState}
          >
            {children}
          </ContextProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };

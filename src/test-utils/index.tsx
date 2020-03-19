import * as React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "theme-ui";
import theme from "../theme";
import ContextProvider from "../components/context/ContextProvider";
import Adapter from "enzyme-adapter-react-16";
import { configure } from "enzyme";
import library from "./fixtures/library";
import { MemoryRouter, Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import BasicAuthPlugin from "opds-web-client/lib/BasicAuthPlugin";
import buildStore from "opds-web-client/lib/store";
import { State } from "opds-web-client/lib/state";
import { LibraryData } from "interfaces";
import "./mockScrollTo";
// our fixtures
import * as fixtures from "./fixtures";
export { fixtures };

configure({ adapter: new Adapter() });

export const mockDispatch = jest.fn();

type CustomRenderOptions = Parameters<typeof render>[1] & {
  route?: string;
  initialState?: State;
  library?: LibraryData;
};
const customRender = (ui: any, options?: CustomRenderOptions) => {
  const pathFor = jest
    .fn()
    .mockImplementation((collectionUrl?: string, bookUrl?: string) =>
      `/${collectionUrl}` + bookUrl ? `/${bookUrl}` : ""
    );

  const store = buildStore(options?.initialState, [BasicAuthPlugin], pathFor);
  store.dispatch = mockDispatch;

  const history = createMemoryHistory({
    initialEntries: [options?.route ?? "/"]
  });

  const AllTheProviders = ({ children }) => {
    return (
      <Router history={history}>
        <ThemeProvider theme={theme}>
          <ContextProvider
            library={options?.library ?? library}
            shortenUrls
            helmetContext={{}}
            initialState={options?.initialState}
            store={store}
          >
            {children}
          </ContextProvider>
        </ThemeProvider>
      </Router>
    );
  };

  return {
    ...render(ui, { wrapper: AllTheProviders, ...options }),
    // we pass the store and history along so we can assert on it
    store,
    history
  };
};

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };

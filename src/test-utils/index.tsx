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
import BasicAuthPlugin from "opds-web-client/lib/BasicAuthPlugin";
import buildStore from "opds-web-client/lib/store";
import { State } from "opds-web-client/lib/state";
import { LibraryData } from "interfaces";
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

  const AllTheProviders = ({ children }) => {
    return (
      <MemoryRouter initialEntries={[options?.route ?? "/"]}>
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
      </MemoryRouter>
    );
  };

  return {
    ...render(ui, { wrapper: AllTheProviders, ...options }),
    // we pass the store along so we can assert on it
    store
  };
};

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };

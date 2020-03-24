import * as React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "theme-ui";
import theme from "../theme";
import ContextProvider from "../components/context/ContextProvider";
import Adapter from "enzyme-adapter-react-16";
import { configure } from "enzyme";
import library from "./fixtures/library";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import BasicAuthPlugin from "../authPlugin";
import buildStore from "opds-web-client/lib/store";
import { State } from "opds-web-client/lib/state";
import { LibraryData } from "interfaces";
import "./mockScrollTo";
import * as fixtures from "./fixtures";
import ActionsCreator from "opds-web-client/lib/actions";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";

export { fixtures };

configure({ adapter: new Adapter() });

/**
 * We create the actions and fetcher here so that they can
 * be imported by our test file and spied on using:
 * jest.spyOn(actions, "fetchSearchDescription")
 * and then asserted against
 */
export const fetcher = new DataFetcher({ adapter });
export const actions = new ActionsCreator(fetcher);

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

  // spy on dispatch by default
  const origDispatch = store.dispatch;
  const mockDispatch: jest.Mock<typeof origDispatch> = jest
    .fn()
    .mockImplementation(origDispatch);
  store.dispatch = mockDispatch as typeof origDispatch;
  // const dispatch = jest.spyOn(store, "dispatch");

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
            fetcher={fetcher}
            actions={actions}
          >
            {children}
          </ContextProvider>
        </ThemeProvider>
      </Router>
    );
  };

  return {
    ...render(ui, { wrapper: AllTheProviders, ...options }),
    // we pass our mocks along so they can be used in assertions
    store,
    history,
    dispatch: mockDispatch
  };
};

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };

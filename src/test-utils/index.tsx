import * as React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { beforeEach, expect, jest } from "@jest/globals";
import Adapter from "enzyme-adapter-react-16";
import { configure } from "enzyme";
import { LibraryData } from "../interfaces";
import "./mockScrollTo";
import * as fixtures from "./fixtures";
import serializer from "jest-emotion";
import { Provider as ReakitProvider } from "reakit";
import { MockNextRouterContextProvider } from "./mockNextRouter";
import { NextRouter } from "next/router";
import { enableFetchMocks } from "jest-fetch-mock";
import { LibraryProvider } from "components/context/LibraryContext";
import { BreadcrumbProvider } from "components/context/BreadcrumbContext";
import { UserContext, UserState } from "components/context/UserContext";
import { ThemeProvider } from "theme-ui";
import makeTheme from "theme";
import mockConfig from "test-utils/mockConfig";
import track from "analytics/track";
import "react-intersection-observer/test-utils";
import "test-utils/mockToDateString";

enableFetchMocks();
expect.addSnapshotSerializer(serializer);

// standard config mock
beforeEach(() => {
  mockConfig();
});

// mock the error tracker to prevent unnecessary console logs
export const mockTrackError = jest.fn();
track.error = mockTrackError;

export { fixtures };

// configure the enzyme adapter
configure({ adapter: new Adapter() });

/**
 * mock out the window.URL.createObjectURL since it isn't
 * available on jsdom
 */
const mockCreateObjectURL = jest.fn();
(global as any)["URL"].createObjectURL = mockCreateObjectURL;

type CustomRenderOptions = Parameters<typeof render>[1] & {
  router?: Partial<NextRouter>;
  library?: Partial<LibraryData>;
  user?: Partial<UserState>;
};
/**
 * Our custom render function wraps components in mocked versions of our
 * providers
 */
const customRender = (ui: any, options?: CustomRenderOptions) => {
  const library: LibraryData = {
    ...fixtures.libraryData,
    ...options?.library
  };
  const theme = makeTheme(library.colors);

  const user: UserState = {
    ...fixtures.user,
    ...options?.user
  };

  const AllTheProviders: React.FC = ({ children }) => {
    return (
      <MockNextRouterContextProvider router={options?.router}>
        <ThemeProvider theme={theme}>
          <ReakitProvider>
            <LibraryProvider library={library}>
              <UserContext.Provider value={user}>
                <BreadcrumbProvider>{children}</BreadcrumbProvider>
              </UserContext.Provider>
            </LibraryProvider>
          </ReakitProvider>
        </ThemeProvider>
      </MockNextRouterContextProvider>
    );
  };
  return {
    ...render(ui, { wrapper: AllTheProviders, ...options })
  };
};

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };

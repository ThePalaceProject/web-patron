// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LibraryData } from "../interfaces";
import "./mockScrollTo";
import * as fixtures from "./fixtures";
import userEvent from "@testing-library/user-event";
import serializer from "jest-emotion";
import { MockNextRouterContextProvider } from "./mockNextRouter";
import { NextRouter } from "next/router";
import { enableFetchMocks } from "jest-fetch-mock";
import { LibraryProvider } from "components/context/LibraryContext";
import { BreadcrumbProvider } from "components/context/BreadcrumbContext";
import { UserContext, UserState } from "components/context/UserContext";
import { ThemeUIProvider } from "theme-ui";
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

  interface AllTheProvidersProps {
    children?: React.ReactNode;
  }

  const AllTheProviders = ({ children }: AllTheProvidersProps) => {
    return (
      <MockNextRouterContextProvider router={options?.router}>
        <ThemeUIProvider theme={theme}>
          <LibraryProvider library={library}>
            <UserContext.Provider value={user}>
              <BreadcrumbProvider>{children}</BreadcrumbProvider>
            </UserContext.Provider>
          </LibraryProvider>
        </ThemeUIProvider>
      </MockNextRouterContextProvider>
    );
  };
  return {
    ...render(ui, { wrapper: AllTheProviders, ...options })
  };
};

/**
 * setup function
 * see: https://testing-library.com/docs/user-event/intro/#writing-tests-with-userevent
 * this should enable tests to use a single "user" to mock events, e.g. user.click(), user.type()
 * currently, this doesn't work for await user.click() which is likely related to any click handlers
 * that are asynchronous
 * not sure why, but defining advanceTimers resolves timeout issues that occurred when upgrading to library-testing/user-event@^14.5.2
 * see: https://testing-library.com/docs/user-event/options/#advancetimers
 */
function setup(jsx: any, options?: CustomRenderOptions) {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  return {
    user: user,
    ...customRender(jsx, options)
  };
}

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render, setup };

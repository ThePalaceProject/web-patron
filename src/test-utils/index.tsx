import * as React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AppConfig, LibraryData } from "../interfaces";
import "./mockScrollTo";
import "./mockCssSupports";
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
import mockCookie from "../../__mocks__/js-cookie";
import track from "analytics/track";
import "react-intersection-observer/test-utils";
import { mockToDateString } from "test-utils/mockToDateString";
import AppConfigContext from "components/context/AppConfigContext";
import { getCurrentTestConfig } from "test-utils/mockConfig";
import { mockUseTranslation } from "test-utils/mockUseTranslation";
import { mockTrans } from "test-utils/mockTrans";

// mock next-i18next for all tests
// so we don't need to repeat this in each test file.
// Note the "/pages" subpath: next-i18next's root export is the App Router
// build, and this app uses the Pages Router.
jest.mock("next-i18next/pages", () => ({
  useTranslation: () => mockUseTranslation(),
  Trans: (props: Parameters<typeof mockTrans>[0]) => mockTrans(props)
}));

// mock serverSideTranslations so page-props tests don't load real locale files.
// The real implementation awaits i18next's init, which i18next defers with
// setTimeout. This project enables fake timers globally (see jest.config.js),
// so that timer never fires and the await would hang forever.
jest.mock("next-i18next/pages/serverSideTranslations", () => ({
  serverSideTranslations: async (locale: string, ns: string[]) => ({
    _nextI18Next: {
      initialI18nStore: { [locale]: {} },
      initialLocale: locale,
      ns,
      userConfig: null
    }
  })
}));

enableFetchMocks();
expect.addSnapshotSerializer(serializer);

// standard config mock
beforeEach(() => {
  mockConfig();
  mockToDateString();
  localStorage.clear();
  mockCookie.reset();
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
  appConfig?: Partial<AppConfig>;
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

  // @ts-expect-error loans optional here, but required in UserState
  const user: UserState = {
    ...fixtures.user,
    ...options?.user
  };

  const appConfig: AppConfig = {
    ...getCurrentTestConfig(),
    ...options?.appConfig
  };

  interface AllTheProvidersProps {
    children: React.ReactNode;
  }

  const AllTheProviders = ({ children }: AllTheProvidersProps) => {
    return (
      <MockNextRouterContextProvider router={options?.router}>
        <AppConfigContext.Provider value={appConfig}>
          <ThemeUIProvider theme={theme}>
            <LibraryProvider library={library}>
              <UserContext.Provider value={user}>
                <BreadcrumbProvider>{children}</BreadcrumbProvider>
              </UserContext.Provider>
            </LibraryProvider>
          </ThemeUIProvider>
        </AppConfigContext.Provider>
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

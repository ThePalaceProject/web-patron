/* eslint-disable camelcase */
import * as React from "react";
import { render } from "@testing-library/react";
import { MockNextRouterContextProvider } from "test-utils/mockNextRouter";
import useFirebaseAnalytics from "analytics/useFirebaseAnalytics";
import FALLBACK_APP_CONFIG from "config/fallbackAppConfig";
import { firebaseConfig } from "test-utils/fixtures/config";
import type { NextRouter } from "next/router";
import type { AppConfig } from "interfaces";

const mockInit = jest.fn();
const mockLogEvent = jest.fn();

jest.mock("analytics/firebase", () => ({
  __esModule: true,
  default: {
    init: (...args: unknown[]) => mockInit(...args),
    logEvent: (...args: unknown[]) => mockLogEvent(...args)
  }
}));

const APP_CONFIG_FIREBASE_ENABLED: AppConfig = {
  ...FALLBACK_APP_CONFIG,
  firebaseAnalytics: { enable: true, config: firebaseConfig }
};
const LIBRARY = { id: "urn:uuid:abc-123", slug: "testlib" };

type Library = typeof LIBRARY | null;
type Props = {
  library: Library;
  /** _app passes FALLBACK_APP_CONFIG on a render without pageProps. */
  appConfig?: AppConfig;
  router?: Partial<NextRouter>;
  /** The page's own <title>, when it renders one. */
  title?: string;
};

/**
 * Stand in for <Head> from next/head
 */
function PageTitle({ title }: { title: string }) {
  React.useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}

function MyApp({
  appConfig,
  library,
  children
}: {
  appConfig: AppConfig;
  library: Library;
  children?: React.ReactNode;
}) {
  useFirebaseAnalytics(appConfig, library);
  return <>{children}</>;
}

/**
 * Puts the router inside the rendered tree rather than in a wrapper,
 * so a rerender can move the hook between router states
 */
function renderFirebaseHook(props: Props) {
  const tree = ({
    library,
    appConfig = APP_CONFIG_FIREBASE_ENABLED,
    router,
    title
  }: Props) => (
    <MockNextRouterContextProvider router={router}>
      <MyApp appConfig={appConfig} library={library}>
        {title && <PageTitle title={title} />}
      </MyApp>
    </MockNextRouterContextProvider>
  );
  const utils = render(tree(props));
  return {
    ...utils,
    rerenderFirebaseHook: (next: Props) => utils.rerender(tree(next))
  };
}

/**
 * useFirebaseAnalytics reads page_location from the window, not from `asPath`.
 */
function setHref(href: string) {
  window.history.replaceState({}, "", href);
}

beforeEach(() => {
  setHref("/testlib");
  document.title = "Previous Page";
});

describe("initialization", () => {
  it("starts init before the first page view", () => {
    renderFirebaseHook({ library: LIBRARY });

    // React runs effects in declaration order
    // init should run before logEvent
    expect(mockInit).toHaveBeenCalledWith(APP_CONFIG_FIREBASE_ENABLED, LIBRARY);
    expect(mockInit.mock.invocationCallOrder[0]).toBeLessThan(
      mockLogEvent.mock.invocationCallOrder[0]
    );
  });

  it("re-runs init with the real config when fallback props arrive", () => {
    // A fallback render has no pageProps, so _app passes FALLBACK_APP_CONFIG,
    // which leaves analytics disabled. The SDK starts loading once the
    // props pass the real appConfig.
    const { rerenderFirebaseHook } = renderFirebaseHook({
      library: null,
      appConfig: FALLBACK_APP_CONFIG,
      router: { isFallback: true }
    });
    expect(mockInit).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledWith(FALLBACK_APP_CONFIG, null);

    rerenderFirebaseHook({ library: LIBRARY });

    expect(mockInit).toHaveBeenCalledTimes(2);
    expect(mockInit).toHaveBeenLastCalledWith(
      APP_CONFIG_FIREBASE_ENABLED,
      LIBRARY
    );
  });

  it("re-runs init when the library changes", () => {
    const { rerenderFirebaseHook } = renderFirebaseHook({ library: LIBRARY });

    expect(mockInit).toHaveBeenCalledWith(APP_CONFIG_FIREBASE_ENABLED, LIBRARY);

    rerenderFirebaseHook({
      library: { id: "urn:uuid:new-library", slug: "new-library" }
    });
    expect(mockInit).toHaveBeenCalledWith(APP_CONFIG_FIREBASE_ENABLED, {
      id: "urn:uuid:new-library",
      slug: "new-library"
    });
  });
});

describe("page views", () => {
  it("sends one page view for the initial render", () => {
    renderFirebaseHook({ library: LIBRARY, title: "Test Library" });

    expect(mockLogEvent).toHaveBeenCalledTimes(1);
    expect(mockLogEvent).toHaveBeenCalledWith("page_view", {
      page_location: "http://test-domain.com/testlib",
      page_title: "Test Library",
      locale: "en"
    });
  });

  it("does not repeat a page view for the URL it last logged", () => {
    const { rerenderFirebaseHook } = renderFirebaseHook({ library: LIBRARY });
    expect(mockLogEvent).toHaveBeenCalledTimes(1);

    // any change in asPath might signal that a navigation might have happened
    // But the check should be done against window.location.href
    rerenderFirebaseHook({
      library: LIBRARY,
      router: { asPath: "/[library]" }
    });

    expect(mockLogEvent).toHaveBeenCalledTimes(1);
  });

  describe("fallback rendering", () => {
    it("sends nothing during a fallback render", () => {
      renderFirebaseHook({
        library: null,
        appConfig: FALLBACK_APP_CONFIG,
        router: { isFallback: true }
      });

      expect(mockLogEvent).not.toHaveBeenCalled();
    });

    it("sends exactly one page view when fallback props arrive", () => {
      const { rerenderFirebaseHook } = renderFirebaseHook({
        library: null,
        appConfig: FALLBACK_APP_CONFIG,
        router: { isFallback: true }
      });
      expect(mockLogEvent).not.toHaveBeenCalled();

      rerenderFirebaseHook({
        library: LIBRARY,
        router: { isFallback: false },
        title: "Test Library"
      });

      expect(mockLogEvent).toHaveBeenCalledTimes(1);
      expect(mockLogEvent).toHaveBeenCalledWith(
        "page_view",
        expect.objectContaining({ page_title: "Test Library" })
      );
    });
  });

  describe("navigation", () => {
    it("sends a page view for each navigation", () => {
      const { rerenderFirebaseHook } = renderFirebaseHook({
        library: LIBRARY,
        title: "Test Library"
      });
      expect(mockLogEvent).toHaveBeenCalledTimes(1);
      expect(mockLogEvent).toHaveBeenLastCalledWith("page_view", {
        page_location: "http://test-domain.com/testlib",
        page_title: "Test Library",
        locale: "en"
      });

      setHref("/testlib/book/123");
      rerenderFirebaseHook({
        library: LIBRARY,
        router: { asPath: "/testlib/book/123" },
        title: "A Book"
      });

      expect(mockLogEvent).toHaveBeenCalledTimes(2);
      expect(mockLogEvent).toHaveBeenLastCalledWith("page_view", {
        page_location: "http://test-domain.com/testlib/book/123",
        page_title: "A Book",
        locale: "en"
      });
    });

    it("sends a page view on returning to an earlier page", () => {
      // first page navigation
      const { rerenderFirebaseHook } = renderFirebaseHook({ library: LIBRARY });

      // second page navigation
      setHref("/testlib/book/123");
      rerenderFirebaseHook({
        library: LIBRARY,
        router: { asPath: "/testlib/book/123" }
      });

      // Back to where the patron started: a repeat visit, not a re-render.
      setHref("/testlib");
      rerenderFirebaseHook({
        library: LIBRARY,
        router: { asPath: "/testlib" }
      });

      expect(mockLogEvent).toHaveBeenCalledTimes(3);
      expect(mockLogEvent).toHaveBeenLastCalledWith(
        "page_view",
        expect.objectContaining({
          page_location: "http://test-domain.com/testlib"
        })
      );
    });
  });

  describe("stripping credentials from page location", () => {
    it.each([
      ["SAML or OIDC", "/testlib?access_token=secret&patron_info=%7B%7D"],
      ["Clever", "/testlib#access_token=secret"]
    ])(
      "leaves the patron's token out of the page view after a %s sign-in",
      (_, pathWithCredentials) => {
        setHref(pathWithCredentials);
        renderFirebaseHook({ library: LIBRARY });

        expect(mockLogEvent).toHaveBeenCalledWith(
          "page_view",
          expect.objectContaining({
            page_location: "http://test-domain.com/testlib"
          })
        );
        expect(JSON.stringify(mockLogEvent.mock.calls)).not.toContain("secret");
      }
    );

    it("does not send a second page view once the token is cleared from the address", () => {
      setHref("/testlib?access_token=secret");
      const { rerenderFirebaseHook } = renderFirebaseHook({
        library: LIBRARY,
        router: { asPath: "/testlib?access_token=secret" }
      });
      expect(mockLogEvent).toHaveBeenCalledTimes(1);

      setHref("/testlib");
      rerenderFirebaseHook({
        library: LIBRARY,
        router: { asPath: "/testlib" }
      });

      expect(mockLogEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe("i18n", () => {
    it("reads the locale-prefixed href rather than asPath", () => {
      setHref("/fr/testlib");
      renderFirebaseHook({
        library: LIBRARY,
        router: { locale: "fr", asPath: "/testlib" }
      });

      expect(mockLogEvent).toHaveBeenCalledWith(
        "page_view",
        expect.objectContaining({
          page_location: expect.stringContaining("/fr/testlib"),
          locale: "fr"
        })
      );
    });

    it("sends a page view when the patron switches language on the same page", () => {
      const { rerenderFirebaseHook } = renderFirebaseHook({ library: LIBRARY });
      expect(mockLogEvent).toHaveBeenCalledTimes(1);
      expect(mockLogEvent).toHaveBeenLastCalledWith(
        "page_view",
        expect.objectContaining({
          page_location: "http://test-domain.com/testlib",
          locale: "en"
        })
      );

      setHref("/fr/testlib");
      rerenderFirebaseHook({ library: LIBRARY, router: { locale: "fr" } });

      expect(mockLogEvent).toHaveBeenCalledTimes(2);
      expect(mockLogEvent).toHaveBeenLastCalledWith(
        "page_view",
        expect.objectContaining({
          page_location: "http://test-domain.com/fr/testlib",
          locale: "fr"
        })
      );
    });
  });
});

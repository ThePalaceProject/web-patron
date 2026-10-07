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
    router = {
      pathname: "/[library]/book/[bookUrl]",
      asPath: "/testlib/book/123"
    },
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
 * useFirebaseAnalytics reads page_location from router.pathname, not from router.asPath.
 * Sets href on window to test that page_location is set from pathname and not address bar
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
  it("sends path for route file, not for the populated URL as seen in the address bar", () => {
    setHref("/testlib/book/123");
    renderFirebaseHook({
      library: LIBRARY,
      router: {
        asPath: "/testlib/book/123",
        pathname: "/[library]/book/[bookUrl]"
      }
    });
    expect(mockLogEvent).toHaveBeenCalledTimes(1);
    expect(mockLogEvent).toHaveBeenCalledWith(
      "page_view",
      expect.objectContaining({
        page_location: "http://test-domain.com/[library]/book/[bookUrl]"
      })
    );
  });

  it("does not repeat a page view for the page_location it last logged", () => {
    const { rerenderFirebaseHook } = renderFirebaseHook({
      library: LIBRARY,
      router: { asPath: "/[library]", pathname: "/testlib" }
    });
    expect(mockLogEvent).toHaveBeenCalledTimes(1);

    // Any change in asPath signals that a navigation has occured,
    // but the last logged check should be done against window.location.href
    rerenderFirebaseHook({
      library: LIBRARY,
      router: { asPath: "/[library]", pathname: "/testlib" }
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
        router: { isFallback: true, pathname: "/" }
      });
      expect(mockLogEvent).not.toHaveBeenCalled();

      rerenderFirebaseHook({
        library: LIBRARY,
        router: { isFallback: false, pathname: "/[library]" },
        title: "Test Library"
      });

      expect(mockLogEvent).toHaveBeenCalledTimes(1);
      expect(mockLogEvent).toHaveBeenCalledWith(
        "page_view",
        expect.objectContaining({
          page_location: "http://test-domain.com/[library]"
        })
      );
    });
  });

  describe("navigation", () => {
    it("sends a page view for each navigation", () => {
      const { rerenderFirebaseHook } = renderFirebaseHook({
        library: LIBRARY,
        title: "Test Library",
        router: { asPath: "/testlib", pathname: "/[library]" }
      });
      expect(mockLogEvent).toHaveBeenCalledTimes(1);
      expect(mockLogEvent).toHaveBeenLastCalledWith("page_view", {
        page_location: "http://test-domain.com/[library]",
        locale: "en"
      });

      setHref("/testlib/book/123");
      rerenderFirebaseHook({
        library: LIBRARY,
        router: {
          asPath: "/testlib/book/123",
          pathname: "/[library]/book/[bookUrl]"
        },
        title: "A Book"
      });

      expect(mockLogEvent).toHaveBeenCalledTimes(2);
      expect(mockLogEvent).toHaveBeenLastCalledWith("page_view", {
        page_location: "http://test-domain.com/[library]/book/[bookUrl]",
        locale: "en"
      });
    });

    it("sends a page view on returning to an earlier page", () => {
      // first page navigation
      const { rerenderFirebaseHook } = renderFirebaseHook({
        library: LIBRARY,
        router: { asPath: "/testlib", pathname: "/[library]" }
      });

      // second page navigation
      setHref("/testlib/book/123");
      rerenderFirebaseHook({
        library: LIBRARY,
        router: {
          asPath: "/testlib/book/123",
          pathname: "/[library]/book/[bookUrl]"
        }
      });

      // Back to where the patron started: a repeat visit, not a re-render.
      setHref("/testlib");
      rerenderFirebaseHook({
        library: LIBRARY,
        router: { asPath: "/testlib", pathname: "/[library]" }
      });

      expect(mockLogEvent).toHaveBeenCalledTimes(3);
      expect(mockLogEvent).toHaveBeenLastCalledWith(
        "page_view",
        expect.objectContaining({
          page_location: "http://test-domain.com/[library]"
        })
      );
    });

    describe("query params and hashes", () => {
      it.each([
        ["query params", "/testlib?query=param1", "/testlib?query=param2"],
        ["hashes", "/testlib#hash1", "/testlib#hash2"]
      ])("sends a page view when only %s change", (_, path1, path2) => {
        setHref(path1);
        renderFirebaseHook({
          library: LIBRARY,
          router: { asPath: path1, pathname: "/[library]" }
        });

        expect(mockLogEvent).toHaveBeenCalledTimes(1);
        expect(mockLogEvent).toHaveBeenCalledWith(
          "page_view",
          expect.objectContaining({
            page_location: "http://test-domain.com/[library]"
          })
        );

        setHref(path2);
        renderFirebaseHook({
          library: LIBRARY,
          router: { asPath: path2, pathname: "/[library]" }
        });

        expect(mockLogEvent).toHaveBeenCalledTimes(2);
        expect(mockLogEvent).toHaveBeenCalledWith(
          "page_view",
          expect.objectContaining({
            page_location: "http://test-domain.com/[library]"
          })
        );
      });

      describe("stripping credentials from page location", () => {
        it.each([
          ["SAML or OIDC", "/testlib?access_token=secret&patron_info=%7B%7D"],
          ["Clever", "/testlib#access_token=secret"]
        ])(
          "leaves the patron's token out of the page view after a %s sign-in",
          (_, pathWithCredentials) => {
            setHref(pathWithCredentials);
            renderFirebaseHook({
              library: LIBRARY,
              router: { asPath: pathWithCredentials, pathname: "/[library]" }
            });

            expect(mockLogEvent).toHaveBeenCalledWith(
              "page_view",
              expect.objectContaining({
                page_location: "http://test-domain.com/[library]"
              })
            );
            expect(JSON.stringify(mockLogEvent.mock.calls)).not.toContain(
              "secret"
            );
          }
        );

        it("does not send a second page view once the token is cleared from the address", () => {
          setHref("/testlib?access_token=secret");
          const { rerenderFirebaseHook } = renderFirebaseHook({
            library: LIBRARY,
            router: {
              asPath: "/testlib?access_token=secret",
              pathname: "/[library]"
            }
          });
          expect(mockLogEvent).toHaveBeenCalledTimes(1);

          setHref("/testlib");
          rerenderFirebaseHook({
            library: LIBRARY,
            router: { asPath: "/testlib", pathname: "/[library]" }
          });

          expect(mockLogEvent).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe("i18n", () => {
    it("reads the locale from the router", () => {
      setHref("/fr/testlib");
      renderFirebaseHook({
        library: LIBRARY,
        router: { locale: "fr", asPath: "/testlib", pathname: "/[library]" }
      });

      expect(mockLogEvent).toHaveBeenCalledWith(
        "page_view",
        expect.objectContaining({
          page_location: "http://test-domain.com/[library]",
          locale: "fr"
        })
      );
    });

    it("sends a page view when the patron switches language on the same page", () => {
      const { rerenderFirebaseHook } = renderFirebaseHook({
        library: LIBRARY,
        router: {
          locale: "en",
          asPath: "/testlib",
          pathname: "/[library]"
        }
      });
      expect(mockLogEvent).toHaveBeenCalledTimes(1);
      expect(mockLogEvent).toHaveBeenLastCalledWith(
        "page_view",
        expect.objectContaining({
          locale: "en",
          page_location: "http://test-domain.com/[library]"
        })
      );

      setHref("/fr/testlib");
      rerenderFirebaseHook({
        library: LIBRARY,
        router: { locale: "fr", asPath: "/testlib", pathname: "/[library]" }
      });

      expect(mockLogEvent).toHaveBeenCalledTimes(2);
      expect(mockLogEvent).toHaveBeenLastCalledWith(
        "page_view",
        expect.objectContaining({
          locale: "fr",
          page_location: "http://test-domain.com/[library]"
        })
      );
    });
  });
});

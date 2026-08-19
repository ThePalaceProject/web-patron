/**
 * @jest-environment node
 *
 * Tests for the _error page's getInitialProps. Run under the Node.js jest
 * config (jest.config.node.js), which is also what makes IS_SERVER true
 * without mocking: it derives from `typeof window`, and there is no window
 * here. The server branch is the one that has to keep working.
 */

import { describe, expect, test, beforeEach } from "@jest/globals";
import { NextPageContext } from "next";
import ErrorPage from "pages/_error";
import ApplicationError from "errors";
import track from "analytics/track";

jest.mock("analytics/track", () => ({
  __esModule: true,
  default: { error: jest.fn() }
}));

const mockTrackError = track.error as jest.MockedFunction<typeof track.error>;

function errorCtx(over: Partial<NextPageContext> = {}): NextPageContext {
  return {
    res: { statusCode: 500 },
    locale: "en",
    ...over
  } as unknown as NextPageContext;
}

const getInitialProps = ErrorPage.getInitialProps!;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("_error getInitialProps", () => {
  /*
   * Without these props appWithTranslation never creates an i18next instance
   * and every string on the error page falls back to its English defaultValue.
   */
  test("includes translation props so appWithTranslation mounts a provider", async () => {
    const props = await getInitialProps(errorCtx({ locale: "fr" }));

    expect(props).toMatchObject({
      _locale: "fr",
      _nextI18Next: {
        initialLocale: "fr",
        ns: ["translations", "common"]
      }
    });
  });

  test("returns the status code for a generic error", async () => {
    const props = await getInitialProps(
      errorCtx({ res: { statusCode: 503 } as NextPageContext["res"] })
    );

    expect(props).toMatchObject({ statusCode: 503 });
    expect(props).not.toHaveProperty("errorInfo");
  });

  test("defaults to 500 when neither res nor err carries a status", async () => {
    const props = await getInitialProps(errorCtx({ res: undefined }));

    expect(props).toMatchObject({ statusCode: 500 });
  });

  test("reports an ApplicationError and passes its problem document through untouched", async () => {
    const err = new ApplicationError({
      title: "Unknown Server Error",
      detail: "The Circulation Manager returned a 500 error.",
      status: 500
    });

    const props = await getInitialProps(errorCtx({ err }));

    expect(mockTrackError).toHaveBeenCalledWith(err);
    expect(props).toMatchObject({ errorInfo: err.info });
    expect(props).not.toHaveProperty("statusCode");
  });
});

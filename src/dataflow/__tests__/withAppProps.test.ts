import { describe, expect, test, beforeEach } from "@jest/globals";
import { GetServerSidePropsContext, GetStaticPropsContext } from "next";
import fetchMock from "jest-fetch-mock";
import withAppProps, { withAppPropsSSR } from "../withAppProps";
import { resetAuthDocCache } from "../getLibraryData";
import { getLibraries } from "server/libraryRegistry";
import { getAppConfig } from "server/appConfig";
import track from "analytics/track";
import { config } from "test-utils/fixtures/config";
import { authDoc } from "test-utils/fixtures/auth-document";

jest.mock("server/libraryRegistry", () => ({
  getLibraries: jest.fn()
}));

jest.mock("server/appConfig", () => ({
  getAppConfig: jest.fn()
}));

jest.mock("analytics/track", () => ({
  __esModule: true,
  default: { error: jest.fn() }
}));

const mockGetLibraries = getLibraries as jest.MockedFunction<
  typeof getLibraries
>;
const mockGetAppConfig = getAppConfig as jest.MockedFunction<
  typeof getAppConfig
>;
const mockTrackError = track.error as jest.MockedFunction<typeof track.error>;

function staticCtx(params?: Record<string, string>): GetStaticPropsContext {
  return { params };
}

function ssrCtx(params?: Record<string, string>): GetServerSidePropsContext {
  return {
    params,
    res: { statusCode: 200 }
  } as unknown as GetServerSidePropsContext;
}

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.resetMocks();
  resetAuthDocCache();
  mockGetAppConfig.mockResolvedValue(config);
  mockGetLibraries.mockResolvedValue({
    testlib: { title: "Test Library", authDocUrl: "http://auth.doc/document" }
  });
  fetchMock.mockResponse(JSON.stringify(authDoc));
});

describe("withAppProps (static)", () => {
  test("merges library and appConfig into page props with hourly revalidation", async () => {
    const gsp = withAppProps(async () => ({ props: { foo: "bar" } }));
    const result = await gsp(staticCtx({ library: "testlib" }));

    expect(result).toMatchObject({
      revalidate: 3600,
      props: {
        foo: "bar",
        appConfig: config,
        library: { id: "testlib", slug: "testlib", catalogName: authDoc.title }
      }
    });
  });

  test("uses the default library slug when provided", async () => {
    const gsp = withAppProps(undefined, "testlib");
    const result = await gsp(staticCtx());

    expect(result).toMatchObject({
      props: { library: { slug: "testlib" } }
    });
  });

  test("returns notFound for an unknown library slug", async () => {
    mockGetLibraries.mockResolvedValue({});
    const gsp = withAppProps();
    const result = await gsp(staticCtx({ library: "not-there" }));

    expect(result).toEqual({ notFound: true, revalidate: 1 });
    expect(mockTrackError).toHaveBeenCalledTimes(1);
  });

  test("returns error props for a non-404 failure", async () => {
    fetchMock.mockReject(new Error("connection refused"));
    const gsp = withAppProps();
    const result = await gsp(staticCtx({ library: "testlib" }));

    expect(result).toMatchObject({
      revalidate: 1,
      props: { error: { status: 500 } }
    });
    expect(mockTrackError).toHaveBeenCalledTimes(1);
  });

  // the error page renders components that call useTranslation, so it needs an i18next instance
  test("includes translation props on the error path", async () => {
    fetchMock.mockReject(new Error("connection refused"));
    const gsp = withAppProps();
    const result = await gsp(staticCtx({ library: "testlib" }));

    expect(result).toMatchObject({
      props: { _locale: "en", _nextI18Next: expect.anything() }
    });
  });
});

describe("withAppPropsSSR", () => {
  test("merges library and appConfig into page props", async () => {
    const gssp = withAppPropsSSR(async () => ({ props: { foo: "bar" } }));
    const result = await gssp(ssrCtx({ library: "testlib" }));

    expect(result).toMatchObject({
      props: {
        foo: "bar",
        appConfig: config,
        library: expect.objectContaining({ slug: "testlib" }),
        _locale: "en"
      }
    });
  });

  test("awaits page props supplied as a promise", async () => {
    const gssp = withAppPropsSSR(async () => ({
      props: Promise.resolve({ foo: "bar" })
    }));
    const result = await gssp(ssrCtx({ library: "testlib" }));

    expect(result).toMatchObject({ props: { foo: "bar" } });
  });

  test("passes through a page redirect untouched", async () => {
    const redirect = { destination: "/elsewhere", permanent: false };
    const gssp = withAppPropsSSR(async () => ({ redirect }));
    const result = await gssp(ssrCtx({ library: "testlib" }));

    expect(result).toEqual({ redirect });
  });

  test("passes through a page notFound untouched", async () => {
    const gssp = withAppPropsSSR(async () => ({ notFound: true }));
    const result = await gssp(ssrCtx({ library: "testlib" }));

    expect(result).toEqual({ notFound: true });
  });

  test("uses the default library slug when provided", async () => {
    const gssp = withAppPropsSSR(undefined, "testlib");
    const result = await gssp(ssrCtx());

    expect(result).toMatchObject({
      props: { library: { slug: "testlib" } }
    });
  });

  test("returns notFound for an unknown library slug", async () => {
    mockGetLibraries.mockResolvedValue({});
    const gssp = withAppPropsSSR();
    const result = await gssp(ssrCtx({ library: "not-there" }));

    expect(result).toEqual({ notFound: true });
    expect(mockTrackError).toHaveBeenCalledTimes(1);
  });

  test("returns error props and a 500 status for other failures", async () => {
    fetchMock.mockReject(new Error("connection refused"));
    const gssp = withAppPropsSSR();
    const ctx = ssrCtx({ library: "testlib" });
    const result = await gssp(ctx);

    expect(result).toMatchObject({ props: { error: { status: 500 } } });
    expect(ctx.res.statusCode).toBe(500);
    expect(mockTrackError).toHaveBeenCalledTimes(1);
  });

  test("includes translation props on the error path", async () => {
    fetchMock.mockReject(new Error("connection refused"));
    const gssp = withAppPropsSSR();
    const result = await gssp(ssrCtx({ library: "testlib" }));

    expect(result).toMatchObject({
      props: { _locale: "en", _nextI18Next: expect.anything() }
    });
  });
});

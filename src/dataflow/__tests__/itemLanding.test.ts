import { describe, expect, test, beforeEach } from "@jest/globals";
import fetchMock from "jest-fetch-mock";
import {
  getItemLandingProps,
  getItemLandingRouteProps,
  parseWorkId
} from "../itemLanding";
import { DEFAULT_ITEM_LANDING_SLUG } from "constants/app";
import { resetAuthDocCache } from "../getLibraryData";
import { getLibraries } from "server/libraryRegistry";
import { getAppConfig } from "server/appConfig";
import { config } from "test-utils/fixtures/config";
import { authDoc } from "test-utils/fixtures/auth-document";

jest.mock("server/libraryRegistry", () => ({
  getLibraries: jest.fn()
}));

jest.mock("server/appConfig", () => ({
  getAppConfig: jest.fn()
}));

const mockGetLibraries = getLibraries as jest.MockedFunction<
  typeof getLibraries
>;
const mockGetAppConfig = getAppConfig as jest.MockedFunction<
  typeof getAppConfig
>;

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.resetMocks();
  resetAuthDocCache();
  mockGetAppConfig.mockResolvedValue(config);
  fetchMock.mockResponse(JSON.stringify(authDoc));
});

describe("parseWorkId", () => {
  test("returns a plain string param unchanged", () => {
    expect(parseWorkId({ workId: "abc123" })).toBe("abc123");
  });

  test("joins an array param with a slash", () => {
    expect(parseWorkId({ workId: ["urn", "isbn", "123"] })).toBe(
      "urn/isbn/123"
    );
  });

  test("returns an empty string when the param is missing", () => {
    expect(parseWorkId(undefined)).toBe("");
    expect(parseWorkId({})).toBe("");
  });
});

describe("getItemLandingProps", () => {
  test("redirects to the sole configured library", async () => {
    mockGetLibraries.mockResolvedValue({
      testlib: { title: "Test Library", authDocUrl: "http://auth.doc/document" }
    });

    const result = await getItemLandingProps("work-1");

    expect(result).toEqual({
      redirect: {
        destination: `/testlib/book/${encodeURIComponent(
          "/catalog-root/works/work-1"
        )}`,
        permanent: false
      }
    });
  });

  test("percent-encodes the workId in the redirect destination", async () => {
    mockGetLibraries.mockResolvedValue({
      testlib: { title: "Test Library", authDocUrl: "http://auth.doc/document" }
    });

    const result = await getItemLandingProps("urn:uuid:1/2");

    expect(result).toEqual({
      redirect: {
        destination: `/testlib/book/${encodeURIComponent(
          "/catalog-root/works/urn%3Auuid%3A1%2F2"
        )}`,
        permanent: false
      }
    });
  });

  test("redirects to the Open eBooks default library even when the registry has more than one library", async () => {
    mockGetAppConfig.mockResolvedValue({
      ...config,
      openebooks: { defaultLibrary: "oebooks" }
    });
    mockGetLibraries.mockResolvedValue({
      oebooks: { title: "Open eBooks", authDocUrl: "http://auth.doc/document" },
      other: { title: "Other Library", authDocUrl: "http://auth.doc/other" }
    });

    const result = await getItemLandingProps("work-1");

    expect(result).toMatchObject({
      redirect: { destination: expect.stringContaining("/oebooks/book/") }
    });
  });

  test("renders the selector when more than one library is configured", async () => {
    mockGetLibraries.mockResolvedValue({
      lib1: { title: "Library One", authDocUrl: "http://auth.doc/one" },
      lib2: { title: "Library Two", authDocUrl: "http://auth.doc/two" }
    });

    const result = await getItemLandingProps("work-1");

    expect(result).toEqual({ props: { workId: "work-1", appConfig: config } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("renders the selector when no libraries are configured", async () => {
    mockGetLibraries.mockResolvedValue({});

    const result = await getItemLandingProps("work-1");

    expect(result).toEqual({ props: { workId: "work-1", appConfig: config } });
  });

  test("falls through to the selector when the auth document fetch fails", async () => {
    mockGetLibraries.mockResolvedValue({
      testlib: { title: "Test Library", authDocUrl: "http://auth.doc/document" }
    });
    fetchMock.mockReject(new Error("connection refused"));

    const result = await getItemLandingProps("work-1");

    expect(result).toEqual({ props: { workId: "work-1", appConfig: config } });
  });
});

describe("getItemLandingRouteProps", () => {
  const twoLibraries = {
    lib1: { title: "Library One", authDocUrl: "http://auth.doc/one" },
    lib2: { title: "Library Two", authDocUrl: "http://auth.doc/two" }
  };

  test("returns notFound when the first segment is not the landing slug", async () => {
    const result = await getItemLandingRouteProps({
      library: "some-library",
      workId: "work-1"
    });

    expect(result).toEqual({ notFound: true });
    expect(mockGetLibraries).not.toHaveBeenCalled();
  });

  test("serves the landing page at the default slug", async () => {
    mockGetLibraries.mockResolvedValue(twoLibraries);

    const result = await getItemLandingRouteProps({
      library: DEFAULT_ITEM_LANDING_SLUG,
      workId: "work-1"
    });

    expect(result).toEqual({ props: { workId: "work-1", appConfig: config } });
  });

  test("uses configured item_landing_slugs instead of the default", async () => {
    const configWithSlugs = { ...config, itemLandingSlugs: ["find"] };
    mockGetAppConfig.mockResolvedValue(configWithSlugs);
    mockGetLibraries.mockResolvedValue(twoLibraries);

    expect(
      await getItemLandingRouteProps({ library: "find", workId: "work-1" })
    ).toEqual({ props: { workId: "work-1", appConfig: configWithSlugs } });
    expect(
      await getItemLandingRouteProps({
        library: DEFAULT_ITEM_LANDING_SLUG,
        workId: "work-1"
      })
    ).toEqual({ notFound: true });
  });

  test("serves the landing page at every configured slug during a migration", async () => {
    const configWithSlugs = {
      ...config,
      itemLandingSlugs: [DEFAULT_ITEM_LANDING_SLUG, "item"]
    };
    mockGetAppConfig.mockResolvedValue(configWithSlugs);
    mockGetLibraries.mockResolvedValue(twoLibraries);

    expect(
      await getItemLandingRouteProps({
        library: DEFAULT_ITEM_LANDING_SLUG,
        workId: "work-1"
      })
    ).toEqual({ props: { workId: "work-1", appConfig: configWithSlugs } });
    expect(
      await getItemLandingRouteProps({ library: "item", workId: "work-1" })
    ).toEqual({ props: { workId: "work-1", appConfig: configWithSlugs } });
    expect(
      await getItemLandingRouteProps({ library: "other", workId: "work-1" })
    ).toEqual({ notFound: true });
  });

  test("returns notFound for every request when the landing page is disabled", async () => {
    mockGetAppConfig.mockResolvedValue({ ...config, itemLandingSlugs: [] });

    const result = await getItemLandingRouteProps({
      library: DEFAULT_ITEM_LANDING_SLUG,
      workId: "work-1"
    });

    expect(result).toEqual({ notFound: true });
    expect(mockGetLibraries).not.toHaveBeenCalled();
  });
});

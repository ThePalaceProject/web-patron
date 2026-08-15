/**
 * @jest-environment node
 *
 * Tests for the home route's getServerSideProps. Run under the Node.js jest
 * config (jest.config.node.js) because this is server-side only.
 */

import { describe, expect, test, beforeEach } from "@jest/globals";
import { GetServerSidePropsContext } from "next";
import { getServerSideProps } from "pages/index";
import { getAppConfig } from "server/appConfig";
import { config } from "test-utils/fixtures/config";

jest.mock("server/appConfig", () => ({
  getAppConfig: jest.fn()
}));

const mockGetAppConfig = getAppConfig as jest.MockedFunction<
  typeof getAppConfig
>;

function ssrCtx(locale?: string): GetServerSidePropsContext {
  return {
    params: {},
    locale,
    res: { statusCode: 200 }
  } as unknown as GetServerSidePropsContext;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAppConfig.mockResolvedValue(config);
});

describe("home page getServerSideProps", () => {
  /*
   * The non-openebooks branch renders MultiLibraryHome, which calls
   * useTranslation. Without these props appWithTranslation never creates an
   * i18next instance and the page logs NO_I18NEXT_INSTANCE.
   */
  test("includes translation props for the multi-library home", async () => {
    const result = await getServerSideProps(ssrCtx());

    expect(result).toMatchObject({
      props: {
        appConfig: config,
        _locale: "en",
        _nextI18Next: expect.anything()
      }
    });
  });

  test("uses the requested locale", async () => {
    const result = await getServerSideProps(ssrCtx("fr"));

    expect(result).toMatchObject({ props: { _locale: "fr" } });
  });
});

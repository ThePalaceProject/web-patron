/**
 * @jest-environment node
 *
 * Tests for the item landing route's getServerSideProps. Run under the Node.js
 * jest config (jest.config.node.js) because this is server-side only.
 */

import { describe, expect, test, beforeEach } from "@jest/globals";
import { GetServerSidePropsContext } from "next";
import { getServerSideProps } from "pages/[library]/[workId]";
import { getItemLandingRouteProps } from "dataflow/itemLanding";
import { config } from "test-utils/fixtures/config";

jest.mock("dataflow/itemLanding", () => ({
  getItemLandingRouteProps: jest.fn()
}));

const mockGetItemLandingRouteProps =
  getItemLandingRouteProps as jest.MockedFunction<
    typeof getItemLandingRouteProps
  >;

function ssrCtx(locale?: string): GetServerSidePropsContext {
  return {
    params: { library: "_item_", workId: "abc123" },
    locale,
    res: { statusCode: 200 }
  } as unknown as GetServerSidePropsContext;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("item landing getServerSideProps", () => {
  /*
   * ItemLandingPage calls useTranslation, and dataflow/itemLanding is
   * deliberately locale-agnostic, so this route has to merge the i18n props in
   * itself.
   */
  test("merges translation props into the page props", async () => {
    mockGetItemLandingRouteProps.mockResolvedValue({
      props: { workId: "abc123", appConfig: config }
    });

    const result = await getServerSideProps(ssrCtx("fr"));

    expect(result).toMatchObject({
      props: {
        workId: "abc123",
        appConfig: config,
        _locale: "fr",
        _nextI18Next: expect.anything()
      }
    });
  });

  test("passes a notFound result through untouched", async () => {
    mockGetItemLandingRouteProps.mockResolvedValue({ notFound: true });

    const result = await getServerSideProps(ssrCtx());

    expect(result).toEqual({ notFound: true });
  });

  test("passes a redirect result through untouched", async () => {
    const redirect = { destination: "/testlib/book/abc", permanent: false };
    mockGetItemLandingRouteProps.mockResolvedValue({ redirect });

    const result = await getServerSideProps(ssrCtx());

    expect(result).toEqual({ redirect });
  });
});

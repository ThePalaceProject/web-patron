import { describe, expect, test } from "@jest/globals";
import fetchMock from "jest-fetch-mock";
import { MediaSupportLevel, OPDS1 } from "../../interfaces";
import {
  DownloadFulfillment,
  getAppSupportLevel,
  getFulfillmentFromLink
} from "../fulfill";
import mockConfig from "test-utils/mockConfig";

describe("fulfill", () => {
  describe("getFulfillmentFromLink", () => {
    describe("for an indirect bearer token link", () => {
      const link = {
        contentType: OPDS1.EpubMediaType as OPDS1.AnyBookMediaType,
        url: "link-url",
        indirectionType: OPDS1.BearerTokenMediaType as OPDS1.IndirectAcquisitionType,
        supportLevel: "show" as MediaSupportLevel
      };

      test("should return a fulfillment that gets the download url and token by retrieving a bearer token propagation document", async () => {
        const fulfillment = getFulfillmentFromLink(link) as DownloadFulfillment;

        fetchMock.mockResponseOnce(
          /* eslint-disable camelcase */
          JSON.stringify({
            expires_in: 60,
            token_type: "Token-type",
            access_token: "download-token",
            location: "download-url"
          })
          /* eslint-enable camelcase */
        );

        const location = await fulfillment.getLocation("catalog-url", "token");

        expect(fetchMock).toHaveBeenCalledWith("link-url", {
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            Authorization: "token"
          }
        });

        expect(location.url).toBe("download-url");
        expect(location.token).toBe("Token-type download-token");
      });
    });
  });

  describe("getAppSupportLevel", () => {
    const testIndirectionType =
      "application/atom+xml;type=entry;profile=opds-catalog";
    const testContentType =
      'text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"';

    it("support level is 'unsupported', when no default and no media type matches", () => {
      mockConfig({ mediaSupport: {} });
      const supportLevel = getAppSupportLevel(
        testContentType,
        testIndirectionType
      );
      expect(supportLevel).toBe("unsupported");
    });

    it("support level is the specified default, when no media type matches", () => {
      mockConfig({ mediaSupport: { default: "unsupported" } });
      let supportLevel = getAppSupportLevel(
        testContentType,
        testIndirectionType
      );
      expect(supportLevel).toBe("unsupported");

      mockConfig({ mediaSupport: { default: "redirect" } });
      supportLevel = getAppSupportLevel(testContentType, testIndirectionType);
      expect(supportLevel).toBe("redirect");
    });
  });
});

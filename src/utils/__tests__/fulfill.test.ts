import { describe, expect, test } from "@jest/globals";
import fetchMock from "jest-fetch-mock";
import { MediaSupportLevel, OPDS1 } from "../../interfaces";
import { DownloadFulfillment, getFulfillmentFromLink } from "../fulfill";

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

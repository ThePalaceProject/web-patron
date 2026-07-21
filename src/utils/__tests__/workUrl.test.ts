import { buildWorkUrl } from "../workUrl";

describe("buildWorkUrl", () => {
  test("joins the catalog url and workId under /works/", () => {
    expect(buildWorkUrl("https://cm.example.com/catalog", "work-1")).toBe(
      "https://cm.example.com/catalog/works/work-1"
    );
  });

  test("strips a trailing slash from the catalog url", () => {
    expect(buildWorkUrl("https://cm.example.com/catalog/", "work-1")).toBe(
      "https://cm.example.com/catalog/works/work-1"
    );
  });

  test("percent-encodes reserved characters in the workId", () => {
    expect(buildWorkUrl("https://cm.example.com", "urn:uuid:1/2")).toBe(
      "https://cm.example.com/works/urn%3Auuid%3A1%2F2"
    );
  });
});

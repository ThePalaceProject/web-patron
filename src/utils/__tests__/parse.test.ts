import { parseUrl } from "utils/parse";

describe("parseUrl()", () => {
  describe("Invalid URL", () => {
    test("returns null for undefined url", () => {
      const url = parseUrl(undefined);
      expect(url).toBe(null);
    });

    test("returns null for invalid url", () => {
      const url1 = parseUrl("no-protocol");
      expect(url1).toBe(null);

      const url2 = parseUrl("#$%");
      expect(url2).toBe(null);
    });

    test("returns null for insecure url", () => {
      const url = parseUrl("http://wwww.insecure.com");
      expect(url).toBe(null);
    });
  });

  describe("Valid URL", () => {
    test("returns URL for secure url", () => {
      const url = parseUrl("https://www.secure.com");

      expect(url).not.toBeNull();
      if (url) {
        expect(url.href).toBe("https://www.secure.com/");
      }
    });
  });
});

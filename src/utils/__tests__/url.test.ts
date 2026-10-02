import { stripCredentials } from "utils/url";

describe("stripCredentials", () => {
  test("removes the token and patron info a SAML or OIDC sign-in appends", () => {
    expect(
      stripCredentials(
        "https://app.example.com/testlib?access_token=secret&patron_info=%7B%22name%22%3A%22Pat%22%7D"
      )
    ).toBe("https://app.example.com/testlib");
  });

  test("keeps the other query params", () => {
    expect(
      stripCredentials(
        "https://app.example.com/testlib?nextUrl=%2Ftestlib%2Floans&access_token=secret&hello=there"
      )
    ).toBe(
      "https://app.example.com/testlib?nextUrl=%2Ftestlib%2Floans&hello=there"
    );
  });

  test("removes the hash a Clever sign-in returns", () => {
    expect(
      stripCredentials(
        "https://app.example.com/testlib#access_token=secret&patron_info=%7B%7D"
      )
    ).toBe("https://app.example.com/testlib");
  });

  test("leaves a URL without credentials unchanged apart from the hash", () => {
    expect(
      stripCredentials("https://app.example.com/fr/testlib?q=1#main-content")
    ).toBe("https://app.example.com/fr/testlib?q=1");
  });
});

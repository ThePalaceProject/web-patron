import { describe, expect, test } from "@jest/globals";
import fetchMock from "jest-fetch-mock";
import { fetchLibraryLogo } from "dataflow/fetchLibraries";

const AUTH_DOC_URL = "https://cm.example.com/lib/auth";

describe("fetchLibraryLogo", () => {
  test("returns the logo link href, trimmed", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        links: [
          { rel: "start", href: "https://cm.example.com/catalog" },
          { rel: "logo", href: "  https://cm.example.com/logo.png  " }
        ]
      })
    );
    await expect(fetchLibraryLogo(AUTH_DOC_URL)).resolves.toBe(
      "https://cm.example.com/logo.png"
    );
    expect(fetchMock.mock.calls[0][0]).toBe(AUTH_DOC_URL);
  });

  test("returns null when the document has no logo link", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ links: [{ rel: "start", href: "https://x" }] })
    );
    await expect(fetchLibraryLogo(AUTH_DOC_URL)).resolves.toBeNull();
  });

  test("returns null for a non-string logo href", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ links: [{ rel: "logo", href: 123 }] })
    );
    await expect(fetchLibraryLogo(AUTH_DOC_URL)).resolves.toBeNull();
  });

  test("returns null for a whitespace-only logo href", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ links: [{ rel: "logo", href: "   " }] })
    );
    await expect(fetchLibraryLogo(AUTH_DOC_URL)).resolves.toBeNull();
  });

  test("returns null when links is not an array", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ links: { rel: "logo" } }));
    await expect(fetchLibraryLogo(AUTH_DOC_URL)).resolves.toBeNull();
  });

  test("throws on a non-ok response", async () => {
    fetchMock.mockResponseOnce("", { status: 500 });
    await expect(fetchLibraryLogo(AUTH_DOC_URL)).rejects.toThrow(
      "Failed to fetch authentication document"
    );
  });
});

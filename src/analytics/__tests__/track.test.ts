import track from "../track";
import { describe, expect, test } from "@jest/globals";
import fetchMock from "jest-fetch-mock";

describe("open book event", () => {
  test("sends get request to url", async () => {
    expect(fetchMock).toHaveBeenCalledTimes(0);
    track.openBook("https://open-book-url.com");
    expect(fetchMock).toHaveBeenCalledWith("https://open-book-url.com");
  });
});

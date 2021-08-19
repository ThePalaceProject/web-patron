import fetchMock from "jest-fetch-mock";
import fetchWithHeaders from "../fetch";

describe("fetchWithHeaders", () => {
  test("adds the X-Requested-With header", async () => {
    fetchMock.mockResponseOnce("you did it!");

    await fetchWithHeaders("some-url");

    expect(fetchMock).toHaveBeenCalledWith("some-url", {
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    });
  });

  test("adds the Authorization header when a token is supplied", async () => {
    fetchMock.mockResponseOnce("you did it!");

    await fetchWithHeaders("some-url", "some token");

    expect(fetchMock).toHaveBeenCalledWith("some-url", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "some token"
      }
    });
  });

  test("adds any additonal headers that are supplied", async () => {
    fetchMock.mockResponseOnce("you did it!");

    await fetchWithHeaders("some-url", "some token", {
      "Accept-Language": "us-en",
      "X-Something-Else": "what?"
    });

    expect(fetchMock).toHaveBeenCalledWith("some-url", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "some token",
        "Accept-Language": "us-en",
        "X-Something-Else": "what?"
      }
    });
  });

  test("does not add the Authorization header when the token is undefined", async () => {
    fetchMock.mockResponseOnce("you did it!");

    await fetchWithHeaders("some-url", undefined, {
      "X-Something-Else": "what?"
    });

    expect(fetchMock).toHaveBeenCalledWith("some-url", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "X-Something-Else": "what?"
      }
    });
  });

  test("overrides default headers with any supplied additional headers of the same name", async () => {
    fetchMock.mockResponseOnce("you did it!");

    await fetchWithHeaders("some-url", "some token", {
      "X-Requested-With": "I changed it"
    });

    expect(fetchMock).toHaveBeenCalledWith("some-url", {
      headers: {
        "X-Requested-With": "I changed it",
        Authorization: "some token"
      }
    });
  });

  test("does not allow the Authorization header to be overridden when a token is supplied", async () => {
    fetchMock.mockResponseOnce("you did it!");

    await fetchWithHeaders("some-url", "some token", {
      Authorization: "should not change"
    });

    expect(fetchMock).toHaveBeenCalledWith("some-url", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "some token"
      }
    });
  });

  test("does not send headers with undefined value", async () => {
    fetchMock.mockResponseOnce("you did it!");

    await fetchWithHeaders("some-url", "some token", {
      "X-Requested-With": undefined,
      "X-Something-Else": undefined
    });

    expect(fetchMock).toHaveBeenCalledWith("some-url", {
      headers: {
        Authorization: "some token"
      }
    });
  });
});

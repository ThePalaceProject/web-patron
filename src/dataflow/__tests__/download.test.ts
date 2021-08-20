import fetchMock from "jest-fetch-mock";
import downloadFile from "../download";

describe("downloadFile", () => {
  test("should fetch the url with the supplied token", async () => {
    fetchMock.mockResponseOnce("nice job");

    await downloadFile(
      "some-url",
      "title",
      "application/epub+zip",
      "this token"
    );

    expect(fetchMock).toHaveBeenCalledWith("some-url", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "this token"
      }
    });
  });

  test("should retry the request without the X-Requested-With header if there is a network/CORS error", async () => {
    fetchMock.mockRejectOnce();
    fetchMock.mockResponseOnce("nice job");

    await downloadFile(
      "some-url",
      "title",
      "application/epub+zip",
      "this token"
    );

    expect(fetchMock).toBeCalledTimes(2);

    expect(fetchMock).toHaveBeenNthCalledWith(1, "some-url", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "this token"
      }
    });

    expect(fetchMock).toHaveBeenNthCalledWith(2, "some-url", {
      headers: {
        Authorization: "this token"
      }
    });
  });

  test("should retry the request to the redirected url, without any headers, if there is an error response after a redirect", async () => {
    fetchMock.mockResponseOnce("oh no", {
      status: 400,
      // counter >= 1 indicates a redirect occurred in Node's fetch implementation.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: The counter property is not declared in the MockParams type.
      counter: 1,
      url: "redirected-url"
    });

    fetchMock.mockResponseOnce("ok cool");

    await downloadFile(
      "some-url",
      "title",
      "application/epub+zip",
      "this token"
    );

    expect(fetchMock).toBeCalledTimes(2);

    expect(fetchMock).toHaveBeenNthCalledWith(1, "some-url", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Authorization: "this token"
      }
    });

    expect(fetchMock).toHaveBeenNthCalledWith(2, "redirected-url");
  });
});

import * as React from "react";
import { render } from "test-utils";
import WebpubViewer from "components/WebpubViewer";
import { PageNotFoundError } from "errors";
import fetchMock from "jest-fetch-mock";
import { mockPush } from "test-utils/mockNextRouter";

// mock fetch to avoid console errors
fetchMock.mockResponse(JSON.stringify({ some: "response" }));

test("throws error when url does not include bookUrl", () => {
  // suppress console warning about error because they're expected for this test
  jest.spyOn(console, "error").mockImplementation(jest.fn);
  expect(() => render(<WebpubViewer />)).toThrowError(PageNotFoundError);
  expect(() => render(<WebpubViewer />)).toThrow(
    "The requested URL is missing a bookUrl parameter."
  );
});

test("shows fallback and redirects to login if user is not signed in", () => {
  const utils = render(<WebpubViewer />, {
    router: { query: { bookUrl: "http://some-book.com", library: "testlib" } },
    user: { isAuthenticated: false, token: undefined }
  });
  expect(
    utils.getByText("You need to be signed in to view this page.")
  ).toBeInTheDocument();

  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith(
    {
      pathname: "/[library]/login",
      query: {
        library: "testlib",
        bookUrl: "http://some-book.com",
        nextUrl: "/testlib"
      }
    },
    undefined,
    { shallow: true }
  );
});

test("renders viewer div", () => {
  const utils = render(<WebpubViewer />, {
    router: { query: { bookUrl: "http://some-book.com" } },
    user: { isAuthenticated: true }
  });

  expect(utils.getByTestId("viewer")).toBeInTheDocument();
});

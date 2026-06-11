import * as React from "react";
import {
  fireEvent,
  fixtures,
  screen,
  setup,
  waitFor,
  waitForElementToBeRemoved
} from "test-utils";
import BorrowOrReserve from "components/BorrowOrReserve";
import BorrowOrReserveOrPreview from "components/BorrowOrReserveOrPreview";
import * as fetch from "dataflow/opds1/fetch";
import { mockPush, mockReplace } from "test-utils/mockNextRouter";

test("shows correct button for borrowable book", async () => {
  setup(<BorrowOrReserve isBorrow borrowUrl="/url" />);
  await screen.findByRole("button", { name: "Borrow" });
  expect(screen.getByRole("button", { name: "Borrow" })).toBeInTheDocument();
});

test("shows reserve button for reservable book", () => {
  setup(<BorrowOrReserve isBorrow={false} borrowUrl="/url" />);
  expect(screen.getByRole("button", { name: "Reserve" })).toBeInTheDocument();
});

/**
 * Some mock utilites for the next tests
 */
(fetch as any).fetchCollection = jest.fn();
(fetch as any).fetchBook = jest.fn();
const mockedFetchBook = fetch.fetchBook as jest.MockedFunction<
  typeof fetch.fetchBook
>;

test("borrowing calls correct url with token", async () => {
  mockedFetchBook.mockResolvedValueOnce(fixtures.fulfillableBook);
  setup(<BorrowOrReserve isBorrow borrowUrl="/url" />);

  const button = await screen.findByRole("button", {
    name: "Borrow"
  });

  fireEvent.click(button);

  // loading state
  const loading = screen.getByText("Borrowing...");
  expect(loading).toBeInTheDocument();

  // calls borrow
  expect(mockedFetchBook).toHaveBeenCalledTimes(1);
  expect(mockedFetchBook).toHaveBeenCalledWith(
    "/url",
    "http://test-cm.com/catalogUrl",
    "user-token"
  );

  await waitForElementToBeRemoved(() => screen.getByText("Borrowing..."));
});

test("redirects to login when not signed in", async () => {
  const { user } = setup(<BorrowOrReserve isBorrow borrowUrl="/url" />, {
    user: { isAuthenticated: false, token: undefined }
  });

  const button = await screen.findByRole("button", {
    name: "Borrow"
  });
  expect(mockPush).toHaveBeenCalledTimes(0);

  await user.click(button);

  // no loading state
  expect(screen.queryByText("Borrowing...")).not.toBeInTheDocument();

  // doesn't call the borrow book
  expect(mockedFetchBook).not.toHaveBeenCalled();

  /**
   * To ensure browser history is properly maintained,
   * assert that the Next.js router pushes a new entry onto the stack
   * and does not replace (as it does for other redirections to login)
   */
  // redirects to login
  expect(mockPush).toHaveBeenCalledWith(
    {
      pathname: "/[library]/login",
      query: { library: "testlib", nextUrl: "/testlib" }
    },
    undefined,
    { shallow: true }
  );

  expect(mockReplace).not.toHaveBeenCalled();
});

test("calls set book after borrowing", async () => {
  const { user } = setup(<BorrowOrReserve isBorrow borrowUrl="/url" />);
  const button = await screen.findByRole("button", {
    name: "Borrow"
  });

  mockedFetchBook.mockResolvedValueOnce(fixtures.fulfillableBook);
  expect(fixtures.mockSetBook).toHaveBeenCalledTimes(0);

  await user.click(button);

  await waitFor(() => expect(fixtures.mockSetBook).toHaveBeenCalledTimes(1));
});

describe("Preview button (via BorrowOrReserveOrPreview)", () => {
  test("renders Preview button when previewUrl is provided", () => {
    setup(
      <BorrowOrReserveOrPreview
        isBorrow
        borrowUrl="/borrow"
        previewUrl="/preview"
      />
    );
    expect(screen.getByRole("button", { name: "Borrow" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
  });

  test("does not render Preview button when previewUrl is omitted", () => {
    setup(<BorrowOrReserveOrPreview isBorrow borrowUrl="/borrow" />);
    expect(
      screen.queryByRole("button", { name: "Preview" })
    ).not.toBeInTheDocument();
  });

  test("does not render Preview button when previewUrl is null", () => {
    setup(
      <BorrowOrReserveOrPreview
        isBorrow
        borrowUrl="/borrow"
        previewUrl={null}
      />
    );
    expect(
      screen.queryByRole("button", { name: "Preview" })
    ).not.toBeInTheDocument();
  });

  test("renders Preview button for reserve variant when previewUrl is provided", () => {
    setup(
      <BorrowOrReserveOrPreview
        isBorrow={false}
        borrowUrl="/reserve"
        previewUrl="/preview"
      />
    );
    expect(screen.getByRole("button", { name: "Reserve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
  });
});

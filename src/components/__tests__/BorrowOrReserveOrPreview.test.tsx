import * as React from "react";
import { screen, setup, waitFor } from "test-utils";
import BorrowOrReserveOrPreview from "components/BorrowOrReserveOrPreview";
import * as fetch from "dataflow/opds1/fetch";
import { ServerError } from "errors";
import { makeMockTab } from "test-utils/mockTab";

(fetch as any).fetchBook = jest.fn();
const mockedFetchBook = fetch.fetchBook as jest.MockedFunction<
  typeof fetch.fetchBook
>;

window.open = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders borrow button and preview button when both urls provided", () => {
  setup(
    <BorrowOrReserveOrPreview
      isBorrow
      borrowUrl="/borrow"
      previewUrl="https://example.com/preview"
    />
  );
  expect(screen.getByRole("button", { name: "Borrow" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
});

test("preview button does not render when preview url is excluded", () => {
  setup(<BorrowOrReserveOrPreview isBorrow borrowUrl="/borrow" />);
  expect(screen.queryByRole("button", { name: "Borrow" })).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Preview" })
  ).not.toBeInTheDocument();
});

test("preview button does not render when preview url is null", () => {
  setup(
    <BorrowOrReserveOrPreview isBorrow borrowUrl="/borrow" previewUrl={null} />
  );
  expect(screen.queryByRole("button", { name: "Borrow" })).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Preview" })
  ).not.toBeInTheDocument();
});

describe("BorrowOrReserve error handling", () => {
  test("shows error from BorrowOrReserve when user is not authenticated", async () => {
    const { user } = setup(
      <BorrowOrReserveOrPreview isBorrow borrowUrl="/url" />,
      { user: { isAuthenticated: false, token: undefined } }
    );

    const button = await screen.findByRole("button", {
      name: "Borrow"
    });
    await user.click(button);

    expect(
      screen.getByText("Error: You must be signed in to borrow this book.")
    ).toBeInTheDocument();
  });

  test("shows server errors from BorrowOrReserve", async () => {
    const { user } = setup(
      <BorrowOrReserveOrPreview isBorrow borrowUrl="/url" />
    );
    const button = await screen.findByRole("button", {
      name: "Borrow"
    });

    mockedFetchBook.mockRejectedValueOnce(
      new ServerError("/fetched-url", 500, {
        detail: "Something happened on the server",
        status: 500,
        title: "Server goofed"
      })
    );

    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText("Error: Something happened on the server")
      ).toBeInTheDocument();
    });
  });

  test("shows unrecognized fetch errors from BorrowOrReserve", async () => {
    const { user } = setup(
      <BorrowOrReserveOrPreview isBorrow borrowUrl="/url" />
    );
    const button = await screen.findByRole("button", {
      name: "Borrow"
    });

    mockedFetchBook.mockRejectedValueOnce(new Error("You messed up!"));

    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText("Error: An unknown error occurred.")
      ).toBeInTheDocument();
    });
  });
});

describe("PreviewButton error handling", () => {
  test("shows error from PreviewButton when preview URL is non-https", async () => {
    (window.open as jest.Mock).mockReturnValue(makeMockTab());

    const { user } = setup(
      <BorrowOrReserveOrPreview
        isBorrow
        borrowUrl="/url"
        previewUrl="http://example.com/preview"
      />
    );

    await user.click(screen.getByRole("button", { name: "Preview" }));

    expect(
      screen.getByText("Error: Could not open preview.")
    ).toBeInTheDocument();
  });
});

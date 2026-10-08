import * as React from "react";
import { act, fixtures, screen, setup, waitFor } from "test-utils";
import CancelOrReturnOrPreview from "components/CancelOrReturnOrPreview";
import * as fetch from "dataflow/catalog";
import { ServerError } from "errors";
import { makeMockTab } from "test-utils/mockTab";
import { ANNOUNCE_DELAY_MS } from "components/context/AnnouncerContext";

(fetch as any).fetchBook = jest.fn();
const mockedFetchBook = fetch.fetchBook as jest.MockedFunction<
  typeof fetch.fetchBook
>;

window.open = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders cancel button and preview button when both urls provided", () => {
  setup(
    <CancelOrReturnOrPreview
      text="Cancel Reservation"
      loadingText="Cancelling..."
      successMessage="Reservation cancelled."
      revokeUrl="/revoke"
      id="book-id"
      previewUrl="https://example.com/preview"
    />
  );
  expect(
    screen.getByRole("button", { name: "Cancel Reservation" })
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
});

test("renders only preview button when cancel url is null", () => {
  setup(
    <CancelOrReturnOrPreview
      text="Cancel Reservation"
      loadingText="Cancelling..."
      successMessage="Reservation cancelled."
      revokeUrl={null}
      id="book-id"
      previewUrl="https://example.com/preview"
    />
  );
  expect(
    screen.queryByRole("button", { name: "Cancel Reservation" })
  ).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
});

test("renders only cancel button when preview url is excluded", () => {
  setup(
    <CancelOrReturnOrPreview
      text="Cancel Reservation"
      loadingText="Cancelling..."
      successMessage="Reservation cancelled."
      revokeUrl="/revokeUrl"
      id="book-id"
    />
  );
  expect(
    screen.getByRole("button", { name: "Cancel Reservation" })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Preview" })
  ).not.toBeInTheDocument();
});

test("renders only cancel button when preview url is null", () => {
  setup(
    <CancelOrReturnOrPreview
      text="Cancel Reservation"
      loadingText="Cancelling..."
      successMessage="Reservation cancelled."
      revokeUrl="/revokeUrl"
      previewUrl={null}
      id="book-id"
    />
  );
  expect(
    screen.getByRole("button", { name: "Cancel Reservation" })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Preview" })
  ).not.toBeInTheDocument();
});

test("shows error from CancelOrReturn when user is not authenticated", async () => {
  const { user } = setup(
    <CancelOrReturnOrPreview
      text="Cancel Reservation"
      loadingText="Cancelling..."
      successMessage="Reservation cancelled."
      revokeUrl="/revoke"
      id="book-id"
    />,
    { user: { isAuthenticated: false, token: undefined } }
  );

  await user.click(screen.getByRole("button", { name: "Cancel Reservation" }));

  expect(screen.getByText("Error: You must be signed in.")).toBeInTheDocument();
});

test("shows server errors from CancelOrReturn", async () => {
  const { user } = setup(
    <CancelOrReturnOrPreview
      text="Cancel Reservation"
      loadingText="Cancelling..."
      successMessage="Reservation cancelled."
      revokeUrl="/revoke"
      id="book-id"
    />
  );

  mockedFetchBook.mockRejectedValueOnce(
    new ServerError("/fetched-url", 500, {
      detail: "Something happened on the server",
      status: 500,
      title: "Server goofed"
    })
  );

  await user.click(screen.getByRole("button", { name: "Cancel Reservation" }));

  await waitFor(() => {
    expect(
      screen.getByText("Error: Something happened on the server")
    ).toBeInTheDocument();
  });
  act(() => {
    jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
  });
  expect(screen.getByRole("status")).toHaveTextContent("");
});

test("announces the success message once the book is updated", async () => {
  mockedFetchBook.mockResolvedValueOnce(fixtures.borrowableBook);
  const { user } = setup(
    <CancelOrReturnOrPreview
      text="Cancel Reservation"
      loadingText="Cancelling..."
      successMessage="Reservation cancelled."
      revokeUrl="/revoke"
      id="book-id"
    />
  );

  await user.click(screen.getByRole("button", { name: "Cancel Reservation" }));
  await waitFor(() =>
    expect(fixtures.mockSetBook).toHaveBeenCalledWith(
      fixtures.borrowableBook,
      "book-id"
    )
  );
  act(() => {
    jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
  });

  expect(screen.getByRole("status")).toHaveTextContent(
    "Reservation cancelled."
  );
});

test("shows error from PreviewButton when preview URL is non-https", async () => {
  (window.open as jest.Mock).mockReturnValue(makeMockTab());

  const { user } = setup(
    <CancelOrReturnOrPreview
      text="Cancel Reservation"
      loadingText="Cancelling..."
      successMessage="Reservation cancelled."
      revokeUrl="/revoke"
      id="book-id"
      previewUrl="http://example.com/preview"
    />
  );

  await user.click(screen.getByRole("button", { name: "Preview" }));

  expect(
    screen.getByText("Error: Could not open preview.")
  ).toBeInTheDocument();
});

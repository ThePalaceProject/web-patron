import * as React from "react";
import { screen, setup, waitFor } from "test-utils";
import CancelOrReturnOrPreview from "components/CancelOrReturnOrPreview";
import * as fetch from "dataflow/opds1/fetch";
import { ServerError } from "errors";

(fetch as any).fetchBook = jest.fn();
const mockedFetchBook = fetch.fetchBook as jest.MockedFunction<
  typeof fetch.fetchBook
>;

window.open = jest.fn();

function makeMockTab() {
  return {
    opener: undefined as null | undefined,
    close: jest.fn(),
    document: {
      title: "",
      head: { appendChild: jest.fn() },
      body: { appendChild: jest.fn() },
      createElement: jest.fn().mockReturnValue({
        textContent: "",
        style: { cssText: "" },
        name: "",
        content: ""
      })
    },
    location: { href: "" }
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders cancel button and preview button when both urls provided", () => {
  setup(
    <CancelOrReturnOrPreview
      text="Cancel Reservation"
      loadingText="Cancelling..."
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
});

test("shows error from PreviewButton when preview URL is non-https", async () => {
  (window.open as jest.Mock).mockReturnValue(makeMockTab());

  const { user } = setup(
    <CancelOrReturnOrPreview
      text="Cancel Reservation"
      loadingText="Cancelling..."
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

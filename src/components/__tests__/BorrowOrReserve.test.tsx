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
import * as fetch from "dataflow/opds1/fetch";
import { ServerError } from "errors";
import { mockPush } from "test-utils/mockNextRouter";

test("shows correct button for borrowable book", async () => {
  setup(<BorrowOrReserve isBorrow url="/url" />);
  await screen.findByRole("button", { name: "Borrow this book" });
  expect(
    screen.getByRole("button", { name: "Borrow this book" })
  ).toBeInTheDocument();
});

test("shows reserve button for reservable book", () => {
  setup(<BorrowOrReserve isBorrow={false} url="/url" />);
  expect(
    screen.getByRole("button", { name: "Reserve this book" })
  ).toBeInTheDocument();
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
  setup(<BorrowOrReserve isBorrow url="/url" />);

  const button = await screen.findByRole("button", {
    name: "Borrow this book"
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
  const { user } = setup(<BorrowOrReserve isBorrow url="/url" />, {
    user: { isAuthenticated: false, token: undefined }
  });

  const button = await screen.findByRole("button", {
    name: "Borrow this book"
  });
  expect(mockPush).toHaveBeenCalledTimes(0);

  await user.click(button);

  // no loading state
  expect(screen.queryByText("Borrowing...")).not.toBeInTheDocument();

  // error is there
  expect(
    screen.getByText("Error: You must be signed in to borrow this book.")
  ).toBeInTheDocument();

  // doesn't call the borrow book
  expect(mockedFetchBook).not.toHaveBeenCalled();

  // redirects to login
  expect(mockPush).toHaveBeenCalledWith(
    {
      pathname: "/[library]/login",
      query: { library: "testlib", nextUrl: "/testlib" }
    },
    undefined,
    { shallow: true }
  );
});

test("catches and displays server errors", async () => {
  const { user } = setup(<BorrowOrReserve isBorrow url="/url" />);
  const button = await screen.findByRole("button", {
    name: "Borrow this book"
  });

  mockedFetchBook.mockRejectedValueOnce(
    new ServerError("/fetched-url", 500, {
      detail: "Something happened on the server",
      status: 500,
      title: "Server goofed"
    })
  );

  await user.click(button);

  // shows the error, button resets.
  await waitFor(() => {
    expect(
      screen.getByText("Error: Something happened on the server")
    ).toBeInTheDocument();
    expect(screen.queryByText("Borrowing...")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Borrow this book" })
    ).toBeInTheDocument();
  });
});

test("catches unrecognized fetch errors", async () => {
  const { user } = setup(<BorrowOrReserve isBorrow url="/url" />);
  const button = await screen.findByRole("button", {
    name: "Borrow this book"
  });

  mockedFetchBook.mockRejectedValueOnce(new Error("You messed up!"));

  await user.click(button);

  // shows the error, button resets.
  await waitFor(() => {
    expect(
      screen.getByText("Error: An unknown error occurred.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Borrowing...")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Borrow this book" })
    ).toBeInTheDocument();
  });
});

test("calls set book after borrowing", async () => {
  const { user } = setup(<BorrowOrReserve isBorrow url="/url" />);
  const button = await screen.findByRole("button", {
    name: "Borrow this book"
  });

  mockedFetchBook.mockResolvedValueOnce(fixtures.fulfillableBook);
  expect(fixtures.mockSetBook).toHaveBeenCalledTimes(0);

  await user.click(button);

  await waitFor(() => expect(fixtures.mockSetBook).toHaveBeenCalledTimes(1));
});

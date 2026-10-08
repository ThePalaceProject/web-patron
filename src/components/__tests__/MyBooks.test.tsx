import * as React from "react";
import { act, render, fixtures, screen, setup, waitFor } from "test-utils";
import { MyBooks } from "../MyBooks";
import {
  AnyBook,
  BorrowableBook,
  FulfillableBook,
  ReservableBook
} from "interfaces";
import { UserState } from "components/context/UserContext";
import { ANNOUNCE_DELAY_MS } from "components/context/AnnouncerContext";
import * as fetch from "dataflow/catalog";

(fetch as any).fetchBook = jest.fn();
const mockedFetchBook = fetch.fetchBook as jest.MockedFunction<
  typeof fetch.fetchBook
>;

const signedIn = (loans: AnyBook[]): Partial<UserState> => ({
  isAuthenticated: true,
  status: "authenticated",
  isLoading: false,
  loans
});

const returned = (book: FulfillableBook): BorrowableBook => ({
  ...book,
  status: "borrowable",
  borrowUrl: "/borrow"
});

test("shows message and button when not authenticated", () => {
  const utils = render(<MyBooks />);

  expect(
    utils.getByText("You need to be signed in to view this page.")
  ).toBeInTheDocument();
});
test("displays empty state when empty and signed in", async () => {
  const utils = render(<MyBooks />, {
    user: {
      isAuthenticated: true,
      loans: undefined,
      isLoading: false
    }
  });

  expect(
    utils.queryByText("You need to be signed in to view this page.")
  ).not.toBeInTheDocument();

  expect(
    utils.getByText(
      "Your books will show up here when you have any loaned or on hold."
    )
  ).toBeInTheDocument();
});

const books: FulfillableBook[] = [
  ...fixtures.makeFulfillableBooks(10),
  fixtures.mergeBook<FulfillableBook>({
    status: "fulfillable",
    fulfillmentLinks: [fixtures.epubFulfillmentLink],
    revokeUrl: "/revoke-10",
    id: "book 10",
    title: "Book Title 10",
    availability: {
      until: "Jan 2 2020",
      status: "available"
    }
  }),
  fixtures.mergeBook<FulfillableBook>({
    status: "fulfillable",
    fulfillmentLinks: [fixtures.epubFulfillmentLink],
    revokeUrl: "/revoke-11",
    id: "book 11",
    title: "Book Title 11",
    availability: {
      until: "Jan 1 2020",
      status: "available"
    }
  }),
  fixtures.mergeBook<FulfillableBook>({
    status: "fulfillable",
    fulfillmentLinks: [fixtures.epubFulfillmentLink],
    revokeUrl: "/revoke-12",
    id: "book 12",
    title: "Book Title 12",
    availability: {
      until: "Jan 1 2020",
      status: "available"
    }
  })
];

test("displays books when signed in with data", async () => {
  const utils = render(<MyBooks />, {
    user: {
      isAuthenticated: true,
      loans: books,
      isLoading: false
    }
  });

  expect(utils.getByText(fixtures.makeBook(0).title)).toBeInTheDocument();
  expect(utils.getByText(fixtures.makeBook(9).title)).toBeInTheDocument();

  expect(
    utils.queryByText("You need to be signed in to view this page.")
  ).not.toBeInTheDocument();

  expect(
    utils.queryByText(
      "Your books will show up here when you have any loaned or on hold."
    )
  ).toBeFalsy();

  expect(utils.getByText("Book 0 author")).toBeInTheDocument();
});

test("sorts books", () => {
  const utils = render(<MyBooks />, {
    user: {
      isAuthenticated: true,
      loans: books,
      isLoading: false
    }
  });
  const bookNames = utils.queryAllByText(/Book Title/);
  expect(bookNames[0]).toHaveTextContent("Book Title 11");
  expect(bookNames[1]).toHaveTextContent("Book Title 12");
  expect(bookNames[2]).toHaveTextContent("Book Title 10");
  expect(bookNames[3]).toHaveTextContent("Book Title 0");
  expect(bookNames[4]).toHaveTextContent("Book Title 1");
});

test("hides books returned or cancelled before the shelf is fetched again", () => {
  const [onLoan] = fixtures.makeFulfillableBooks(1);
  render(<MyBooks />, {
    user: signedIn([
      onLoan,
      fixtures.mergeBook<BorrowableBook>({
        id: "returned",
        title: "Returned Title",
        status: "borrowable",
        borrowUrl: "/borrow"
      }),
      fixtures.mergeBook<ReservableBook>({
        id: "cancelled",
        title: "Cancelled Title",
        status: "reservable",
        reserveUrl: "/reserve"
      })
    ])
  });

  expect(screen.getByText("Book Title 0")).toBeInTheDocument();
  expect(screen.queryByText("Returned Title")).not.toBeInTheDocument();
  expect(screen.queryByText("Cancelled Title")).not.toBeInTheDocument();
});

test("announces a returned book", async () => {
  const [onLoan] = fixtures.makeFulfillableBooks(1);
  mockedFetchBook.mockResolvedValueOnce(returned(onLoan));
  const { user } = setup(<MyBooks />, { user: signedIn([onLoan]) });

  await user.click(screen.getByRole("button", { name: "Return" }));
  await waitFor(() => expect(fixtures.mockSetBook).toHaveBeenCalled());
  act(() => {
    jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
  });

  expect(screen.getByRole("status")).toHaveTextContent(
    "Book Title 0 returned."
  );
});

import * as React from "react";
import { screen, setup, fireEvent, fixtures, waitFor } from "test-utils";
import { BookListItem } from "components/BookList";
import * as fetch from "dataflow/opds1/fetch";
import {
  BorrowableBook,
  FulfillableBook,
  OnHoldBook,
  ReservableBook,
  ReservedBook
} from "interfaces";
import { mergeBook, mockSetBook } from "test-utils/fixtures";
import { MOCK_DATE_STRING } from "test-utils/mockToDateString";

/**
 * Borrowable
 * OnHold
 * Reservable
 * Reserved
 * Fulfillable
 * Unsupported
 */

(fetch as any).fetchBook = jest.fn();
const mockFetchBook = fetch.fetchBook as jest.MockedFunction<
  typeof fetch.fetchBook
>;

describe("BorrowableBook", () => {
  const borrowableBook = fixtures.mergeBook<BorrowableBook>({
    status: "borrowable",
    borrowUrl: "/borrow",
    copies: {
      total: 13,
      available: 10
    }
  });

  test("shows correct string and link to book details", () => {
    setup(<BookListItem book={borrowableBook} />);

    expect(
      screen.getByText("10 out of 13 copies available.")
    ).toBeInTheDocument();
  });

  test("shows loading state when borrowing, borrows, and revalidates loans", async () => {
    const mockSetBook = jest.fn();
    mockFetchBook.mockResolvedValue(borrowableBook);
    setup(<BookListItem book={borrowableBook} />, {
      user: {
        setBook: mockSetBook,
        isAuthenticated: true,
        loans: fixtures.loans.books
      }
    });

    // click borrow
    fireEvent.click(screen.getByText("Borrow this book"));
    expect(mockFetchBook).toHaveBeenCalledTimes(1);
    expect(mockFetchBook).toHaveBeenCalledWith(
      "/borrow",
      "http://test-cm.com/catalogUrl",
      "user-token"
    );
    const borrowButton = screen.getByRole("button", {
      name: /Borrowing.../i
    });
    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toHaveAttribute("disabled", "");

    // we revalidate the loans
    await waitFor(() =>
      expect(mockSetBook).toHaveBeenCalledWith(borrowableBook)
    );
  });
});

describe("OnHoldBook", () => {
  const onHoldBook = fixtures.mergeBook<OnHoldBook>({
    status: "on-hold",
    borrowUrl: "/borrow",
    availability: {
      status: "ready",
      until: "2020-06-16"
    }
  });

  test("shows correct string and link to book details", () => {
    setup(<BookListItem book={onHoldBook} />);

    expect(screen.getByText("Ready to Borrow")).toBeInTheDocument();
    expect(
      screen.getByText(`You have this book on hold until ${MOCK_DATE_STRING}.`)
    ).toBeInTheDocument();
  });

  test("shows loading state when borrowing, borrows, and revalidates loans", async () => {
    const mockSetBook = jest.fn();
    mockFetchBook.mockResolvedValue(onHoldBook);

    setup(<BookListItem book={onHoldBook} />, {
      user: {
        setBook: mockSetBook,
        isAuthenticated: true,
        loans: fixtures.loans.books
      }
    });

    // click borrow
    fireEvent.click(screen.getByText("Borrow this book"));
    expect(mockFetchBook).toHaveBeenCalledTimes(1);
    expect(mockFetchBook).toHaveBeenCalledWith(
      "/borrow",
      "http://test-cm.com/catalogUrl",
      "user-token"
    );
    const borrowButton = screen.getByRole("button", {
      name: /Borrowing.../i
    });
    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toHaveAttribute("disabled", "");

    // we revalidate the loans
    await waitFor(() => expect(mockSetBook).toHaveBeenCalledWith(onHoldBook));
  });
});

describe("ReservableBook", () => {
  const reservableBook = fixtures.mergeBook<ReservableBook>({
    reserveUrl: "/reserve",
    status: "reservable",
    availability: {
      status: "unavailable"
    },
    copies: {
      total: 13,
      available: 0
    }
  });

  test("displays correct title and subtitle", () => {
    setup(<BookListItem book={reservableBook} />);
    expect(
      screen.getByText("0 out of 13 copies available.")
    ).toBeInTheDocument();
  });

  test("displays reserve button", () => {
    setup(<BookListItem book={reservableBook} />);
    const reserveButton = screen.getByRole("button", {
      name: "Reserve this book"
    });
    expect(reserveButton).toBeInTheDocument();
  });

  test("shows loading state when borrowing, borrows, and revalidates loans", async () => {
    const mockSetBook = jest.fn();
    mockFetchBook.mockResolvedValue(reservableBook);

    setup(<BookListItem book={reservableBook} />, {
      user: {
        setBook: mockSetBook,
        isAuthenticated: true,
        loans: fixtures.loans.books
      }
    });

    // click borrow
    fireEvent.click(screen.getByText("Reserve this book"));
    expect(mockFetchBook).toHaveBeenCalledTimes(1);
    expect(mockFetchBook).toHaveBeenCalledWith(
      "/reserve",
      "http://test-cm.com/catalogUrl",
      "user-token"
    );
    const borrowButton = screen.getByRole("button", {
      name: /Reserving.../i
    });
    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toHaveAttribute("disabled", "");

    // we revalidate the loans
    await waitFor(() =>
      expect(mockSetBook).toHaveBeenCalledWith(reservableBook)
    );
  });
});

describe("ReservedBook", () => {
  const reservedBook = fixtures.mergeBook<ReservedBook>({
    status: "reserved",
    revokeUrl: "/revoke",
    availability: {
      status: "reserved"
    },
    copies: {
      total: 13,
      available: 0
    }
  });

  test("displays reserved status and string ", () => {
    setup(<BookListItem book={reservedBook} />);
    expect(screen.getByText("Reserved"));
  });

  test("allows cancelling reservation", async () => {
    const unreservedBook = mergeBook<BorrowableBook>({
      status: "borrowable",
      borrowUrl: "/borrow"
    });
    mockFetchBook.mockResolvedValue(unreservedBook);
    setup(<BookListItem book={reservedBook} />);
    expect(screen.getByText("Reserved"));
    const cancel = screen.getByRole("button", { name: "Cancel Reservation" });
    expect(cancel).toBeInTheDocument();

    fireEvent.click(cancel);

    expect(
      await screen.findByRole("button", { name: "Cancelling..." })
    ).toBeInTheDocument();

    expect(mockFetchBook).toHaveBeenCalledWith(
      "/revoke",
      "http://test-cm.com/catalogUrl",
      "user-token"
    );

    expect(mockSetBook).toHaveBeenCalledWith(unreservedBook, reservedBook.id);
  });

  test("displays number of patrons in queue and your position", () => {
    const reservedBookWithQueue = fixtures.mergeBook<ReservedBook>({
      status: "reserved",
      revokeUrl: "/revoke",
      availability: {
        status: "reserved"
      },
      copies: {
        total: 13,
        available: 0
      },
      holds: {
        total: 23,
        position: 5
      }
    });
    setup(<BookListItem book={reservedBookWithQueue} />);
    expect(
      screen.getByText("5 patrons ahead of you in the queue.")
    ).toBeInTheDocument();
  });
});

describe("FulfillableBook", () => {
  const downloadableBook = fixtures.mergeBook<FulfillableBook>({
    status: "fulfillable",
    revokeUrl: "/revoke",
    fulfillmentLinks: [
      {
        url: "/epub-link",
        supportLevel: "show",
        contentType: "application/epub+zip"
      },
      {
        url: "/pdf-link",
        supportLevel: "show",
        contentType: "application/pdf"
      }
    ],
    availability: {
      status: "available",
      until: "2020-06-18"
    }
  });

  test("displays FulfillmentButton if only one possibility", () => {
    const book = fixtures.mergeBook<FulfillableBook>({
      status: "fulfillable",
      revokeUrl: "/revoke",
      fulfillmentLinks: [
        {
          url: "/pdf-link",
          supportLevel: "show",
          contentType: "application/pdf"
        },
        {
          url: "/pdf-link",
          supportLevel: "unsupported",
          contentType: "application/pdf"
        }
      ],
      availability: {
        status: "available",
        until: "2020-06-18"
      }
    });
    setup(<BookListItem book={book} />);
    expect(
      screen.getByRole("button", { name: "Download PDF" })
    ).toBeInTheDocument();
  });

  test("doesn't show FulfillmentButton if multiple options", () => {
    setup(<BookListItem book={downloadableBook} />);
    expect(screen.queryByText("Download PDF")).not.toBeInTheDocument();
  });

  test("displays correct title and subtitle and view details", () => {
    setup(<BookListItem book={downloadableBook} />);
    expect(
      screen.getByText(`You have this book on loan until ${MOCK_DATE_STRING}.`)
    ).toBeInTheDocument();
  });

  test("handles lack of availability info", () => {
    const withoutAvailability = fixtures.mergeBook({
      ...downloadableBook,
      availability: undefined
    });
    setup(<BookListItem book={withoutAvailability} />);
    expect(screen.getByText("Ready to Read!")).toBeInTheDocument();
  });
});

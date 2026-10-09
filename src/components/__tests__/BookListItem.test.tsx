import * as React from "react";
import { act, screen, setup, fireEvent, fixtures, waitFor } from "test-utils";
import { BookListItem } from "components/BookList";
import * as fetch from "dataflow/catalog";
import {
  BorrowableBook,
  FulfillableBook,
  OnHoldBook,
  ReservableBook,
  ReservedBook
} from "interfaces";
import { mergeBook, mockSetBook } from "test-utils/fixtures";
import { ANNOUNCE_DELAY_MS } from "components/context/AnnouncerContext";

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
    fireEvent.click(screen.getByText("Borrow"));
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

  test("announces the loan end date after borrowing", async () => {
    mockFetchBook.mockResolvedValue(
      fixtures.mergeBook<FulfillableBook>({
        status: "fulfillable",
        revokeUrl: "/revoke",
        fulfillmentLinks: [],
        availability: { status: "available", until: "2020-06-18T12:00:00Z" }
      })
    );
    setup(<BookListItem book={borrowableBook} />);

    fireEvent.click(screen.getByRole("button", { name: "Borrow" }));
    await waitFor(() => expect(mockSetBook).toHaveBeenCalled());
    act(() => {
      jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Book Availability: Due June 18, 2020"
    );
  });
});

describe("OnHoldBook", () => {
  const onHoldBook = fixtures.mergeBook<OnHoldBook>({
    status: "on-hold",
    borrowUrl: "/borrow",
    availability: {
      status: "ready",
      until: "2020-06-16T12:00:00Z"
    }
  });

  test("shows correct string and link to book details", () => {
    setup(<BookListItem book={onHoldBook} />);

    expect(screen.getByText("Ready to Borrow")).toBeInTheDocument();
    expect(
      screen.getByText("You have this book on hold until June 16, 2020.")
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
    fireEvent.click(screen.getByText("Borrow"));
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
      name: "Reserve"
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
    fireEvent.click(screen.getByText("Reserve"));
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

  test("announces patron place in hold queue after reserving", async () => {
    const mockSetBook = jest.fn();

    const reservedBook = fixtures.mergeBook<ReservedBook>({
      status: "reserved",
      revokeUrl: "/revoke",
      availability: { status: "reserved" },
      copies: { total: 13, available: 0 },
      holds: { total: 2, position: 1 }
    });

    mockFetchBook.mockResolvedValue(reservedBook);

    setup(<BookListItem book={reservableBook} />, {
      user: {
        setBook: mockSetBook,
        isAuthenticated: true,
        loans: fixtures.loans.books
      }
    });

    // click reserve
    fireEvent.click(screen.getByText("Reserve"));

    await waitFor(() => expect(mockSetBook).toHaveBeenCalledWith(reservedBook));
    act(() => {
      jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
    });

    // TODO: Incorrect pluralization (1 patrons) flagged for separate PR
    expect(screen.getByRole("status")).toHaveTextContent(
      "Book Availability: 1 patrons ahead of you in the queue"
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

    await waitFor(() =>
      expect(mockSetBook).toHaveBeenCalledWith(unreservedBook, reservedBook.id)
    );

    expect(
      await screen.findByRole("button", { name: "Cancel Reservation" })
    ).toBeInTheDocument();
  });

  test("announces the cancelled reservation", async () => {
    const unreservedBook = mergeBook<BorrowableBook>({
      status: "borrowable",
      borrowUrl: "/borrow"
    });
    mockFetchBook.mockResolvedValue(unreservedBook);
    setup(<BookListItem book={reservedBook} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel Reservation" }));
    await waitFor(() =>
      expect(mockSetBook).toHaveBeenCalledWith(unreservedBook, reservedBook.id)
    );
    act(() => {
      jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Reservation for The Mayan Secrets cancelled."
    );
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
      until: "2020-06-18T12:00:00Z"
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
        until: "2020-06-18T12:00:00Z"
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
    expect(screen.getByText("Due June 18, 2020")).toBeInTheDocument();
  });

  test("announces the return", async () => {
    const unborrowed = mergeBook<BorrowableBook>({
      status: "borrowable",
      borrowUrl: "/borrow"
    });
    mockFetchBook.mockResolvedValue(unborrowed);
    setup(<BookListItem book={downloadableBook} />);

    fireEvent.click(screen.getByRole("button", { name: "Return" }));
    await waitFor(() =>
      expect(mockSetBook).toHaveBeenCalledWith(unborrowed, downloadableBook.id)
    );
    act(() => {
      jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "The Mayan Secrets returned."
    );
  });

  test("announces the title of the loaned version of the book", async () => {
    const loanedBook = fixtures.mergeBook<FulfillableBook>({
      ...downloadableBook,
      title: "Loaned Title"
    });
    mockFetchBook.mockResolvedValue(
      mergeBook<BorrowableBook>({ status: "borrowable", borrowUrl: "/borrow" })
    );
    setup(<BookListItem book={downloadableBook} />, {
      user: { loans: [loanedBook] }
    });

    fireEvent.click(screen.getByRole("button", { name: "Return" }));
    await waitFor(() => expect(mockSetBook).toHaveBeenCalled());
    act(() => {
      jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loaned Title returned."
    );
  });

  test("announces the return", async () => {
    const unborrowed = mergeBook<BorrowableBook>({
      status: "borrowable",
      borrowUrl: "/borrow"
    });
    mockFetchBook.mockResolvedValue(unborrowed);
    setup(<BookListItem book={downloadableBook} />);

    fireEvent.click(screen.getByRole("button", { name: "Return" }));
    await waitFor(() =>
      expect(mockSetBook).toHaveBeenCalledWith(unborrowed, downloadableBook.id)
    );
    act(() => {
      jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "The Mayan Secrets returned."
    );
  });

  test("announces the title of the loaned version of the book", async () => {
    const loanedBook = fixtures.mergeBook<FulfillableBook>({
      ...downloadableBook,
      title: "Loaned Title"
    });
    mockFetchBook.mockResolvedValue(
      mergeBook<BorrowableBook>({ status: "borrowable", borrowUrl: "/borrow" })
    );
    setup(<BookListItem book={downloadableBook} />, {
      user: { loans: [loanedBook] }
    });

    fireEvent.click(screen.getByRole("button", { name: "Return" }));
    await waitFor(() => expect(mockSetBook).toHaveBeenCalled());
    act(() => {
      jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loaned Title returned."
    );
  });

  test("handles lack of availability info", () => {
    const withoutAvailability = fixtures.mergeBook({
      ...downloadableBook,
      availability: undefined
    });
    setup(<BookListItem book={withoutAvailability} />);
    expect(screen.queryByText("Book Availability:")).not.toBeInTheDocument();
  });

  test("announces only the return when the returned book re-renders", async () => {
    const returnedBook = mergeBook<BorrowableBook>({
      status: "borrowable",
      borrowUrl: "/borrow",
      copies: { total: 3, available: 3 }
    });
    mockFetchBook.mockResolvedValue(returnedBook);
    const { rerender } = setup(<BookListItem book={downloadableBook} />);

    fireEvent.click(screen.getByRole("button", { name: "Return" }));
    await waitFor(() => expect(mockSetBook).toHaveBeenCalled());
    rerender(<BookListItem book={returnedBook} />);
    act(() => {
      jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
    });

    expect(
      screen.getByText("3 out of 3 copies available.")
    ).toBeInTheDocument();
    const statuses = screen.getAllByRole("status");
    expect(statuses).toHaveLength(1);
    expect(statuses[0]).toHaveTextContent("The Mayan Secrets returned.");
  });
});

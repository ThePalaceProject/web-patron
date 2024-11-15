import * as React from "react";
import {
  setup,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  fireEvent
} from "test-utils";
import { mergeBook, mockSetBook } from "test-utils/fixtures";
import FulfillmentCard from "../FulfillmentCard";
import _download from "downloadjs";
import mockConfig from "test-utils/mockConfig";
import {
  BorrowableBook,
  FulfillableBook,
  OnHoldBook,
  ReservableBook,
  ReservedBook
} from "interfaces";
import { ProblemDocument } from "types/opds1";
import fetchMock from "jest-fetch-mock";
import { mockPush } from "test-utils/mockNextRouter";
import * as fetch from "dataflow/opds1/fetch";
import { ServerError } from "errors";
import * as env from "utils/env";
import { MOCK_DATE_STRING } from "test-utils/mockToDateString";

jest.mock("downloadjs");
window.open = jest.fn();

jest.mock("dataflow/opds1/fetch");

(fetch as any).fetchBook = jest.fn();
const mockFetchBook = fetch.fetchBook as jest.MockedFunction<
  typeof fetch.fetchBook
>;
/**
 * Borrowable
 * OnHold
 * Reservable
 * Reserved
 * Fulfillable
 * Unsupported
 */

describe("BorrowableBook", () => {
  const borrowableBook = mergeBook<BorrowableBook>({
    status: "borrowable",
    borrowUrl: "/borrow",
    copies: {
      total: 13,
      available: 10
    }
  });

  test("correct title and subtitle", () => {
    setup(<FulfillmentCard book={borrowableBook} />);
    expect(screen.getByText("Available to borrow")).toBeInTheDocument();
    expect(screen.getByText("10 out of 13 copies available."));
  });

  test("borrow button fetches book and displays borrow errors", async () => {
    const problem: ProblemDocument = {
      detail: "Can't do that",
      title: "Nope",
      status: 418
    };
    mockFetchBook.mockRejectedValue(new ServerError("/borrow", 418, problem));
    setup(<FulfillmentCard book={borrowableBook} />, {
      user: { isAuthenticated: true }
    });
    const borrowButton = await screen.findByRole("button", {
      name: "Borrow this book"
    });
    expect(borrowButton).toBeInTheDocument();

    // click borrow
    fireEvent.click(borrowButton);

    // the borrow button should be gone now
    await waitForElementToBeRemoved(() => screen.queryByText("Borrowing..."));
    expect(screen.getByText("Error: Can't do that"));
  });
});

describe("OnHoldBook", () => {
  const onHoldBook = mergeBook<OnHoldBook>({
    status: "on-hold",
    borrowUrl: "/borrow",
    availability: {
      status: "ready",
      until: "2020-06-16"
    }
  });

  test("correct title and subtitle", () => {
    setup(<FulfillmentCard book={onHoldBook} />);
    expect(screen.getByText("Ready to Borrow")).toBeInTheDocument();
    expect(
      screen.getByText(`You have this book on hold until ${MOCK_DATE_STRING}.`)
    );
  });

  test("borrow button fetches url and shows error", async () => {
    const problem: ProblemDocument = {
      detail: "Can't do that",
      title: "Nope",
      status: 418
    };
    mockFetchBook.mockRejectedValue(new ServerError("/borrow", 418, problem));
    setup(<FulfillmentCard book={onHoldBook} />, {
      user: { isAuthenticated: true }
    });
    const borrowButton = await screen.findByText("Borrow this book");
    expect(borrowButton).toBeInTheDocument();

    // click borrow
    fireEvent.click(borrowButton);

    // the borrow button should be gone now
    await waitForElementToBeRemoved(() => screen.queryByText("Borrowing..."));
    expect(screen.getByText("Error: Can't do that"));
  });

  test("handles lack of availability.until info", () => {
    const withoutCopies = mergeBook({
      ...onHoldBook,
      availability: { status: "ready" }
    });
    setup(<FulfillmentCard book={withoutCopies} />);
    expect(screen.getByText("You have this book on hold."));
  });
});

describe("ReservableBook", () => {
  const reservableBook = mergeBook<ReservableBook>({
    status: "reservable",
    reserveUrl: "/reserve",
    availability: {
      status: "unavailable"
    },
    copies: {
      total: 13,
      available: 0
    }
  });

  test("correct title and subtitle", () => {
    setup(<FulfillmentCard book={reservableBook} />);
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(
      screen.getByText("0 out of 13 copies available.")
    ).toBeInTheDocument();
  });

  test("displays reserve button", async () => {
    setup(<FulfillmentCard book={reservableBook} />);
    const reserveButton = await screen.findByRole("button", {
      name: /Reserve/i
    });
    expect(reserveButton).toBeInTheDocument();
  });

  test("shows number of patrons in queue when holds info present", () => {
    const bookWithQueue = mergeBook({
      ...reservableBook,
      holds: {
        total: 4
      }
    });
    setup(<FulfillmentCard book={bookWithQueue} />);
    expect(
      screen.getByText("0 out of 13 copies available. 4 patrons in the queue.")
    );
  });

  test("doesn't show patrons in queue when holds info no present", () => {
    setup(<FulfillmentCard book={reservableBook} />);
    expect(
      screen.getByText("0 out of 13 copies available.")
    ).toBeInTheDocument();
  });

  test("handles unknown availability numbers", () => {
    const bookWithQueue = mergeBook<ReservableBook>({
      status: "reservable",
      reserveUrl: "/reserve",
      copies: undefined
    });
    setup(<FulfillmentCard book={bookWithQueue} />);
    expect(
      screen.getByRole("button", { name: "Reserve this book" })
    ).toBeInTheDocument();
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
  });

  test("shows reserve button which fetches book", async () => {
    const problem: ProblemDocument = {
      detail: "Can't do that",
      title: "Nope",
      status: 418
    };
    mockFetchBook.mockRejectedValue(new ServerError("/borrow", 418, problem));
    setup(<FulfillmentCard book={reservableBook} />, {
      user: { isAuthenticated: true }
    });
    const reserveButton = await screen.findByText("Reserve this book");
    expect(reserveButton).toBeInTheDocument();

    // click borrow
    fireEvent.click(reserveButton);

    // the borrow button should be gone now
    await waitForElementToBeRemoved(() => screen.queryByText("Reserving..."));
    expect(screen.getByText("Error: Can't do that"));
  });
});

describe("reserved", () => {
  const reservedBook = mergeBook<ReservedBook>({
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

  test("displays cancel reservation button that calls apropriate url", async () => {
    const unreservedBook = mergeBook<BorrowableBook>({
      status: "borrowable",
      borrowUrl: "/borrow"
    });
    mockFetchBook.mockResolvedValue(unreservedBook);
    setup(<FulfillmentCard book={reservedBook} />);
    const revokeButton = await screen.findByRole("button", {
      name: "Cancel Reservation"
    });
    expect(revokeButton).toBeInTheDocument();

    fireEvent.click(revokeButton);

    expect(
      screen.getByRole("button", { name: "Cancelling..." })
    ).toBeInTheDocument();

    await waitForElementToBeRemoved(() =>
      screen.getByRole("button", { name: "Cancelling..." })
    );

    expect(mockFetchBook).toHaveBeenCalledWith(
      "/revoke",
      "http://test-cm.com/catalogUrl",
      "user-token"
    );

    expect(mockSetBook).toHaveBeenCalledWith(unreservedBook, reservedBook.id);
  });

  test("handles cancel reservation errors", async () => {
    const problem: ProblemDocument = {
      detail: "Can't do that",
      title: "Nope",
      status: 418
    };
    mockFetchBook.mockRejectedValue(new ServerError("/revoke", 418, problem));
    setup(<FulfillmentCard book={reservedBook} />);
    const revokeButton = await screen.findByRole("button", {
      name: "Cancel Reservation"
    });
    expect(revokeButton).toBeInTheDocument();

    fireEvent.click(revokeButton);

    expect(
      await screen.findByRole("button", { name: "Cancelling..." })
    ).toBeInTheDocument();

    expect(mockFetchBook).toHaveBeenCalledWith(
      "/revoke",
      "http://test-cm.com/catalogUrl",
      "user-token"
    );

    expect(await screen.findByText("Error: Can't do that")).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Cancel Reservation" })
    ).toBeInTheDocument();
  });

  test("displays number of patrons in queue and your position", () => {
    const reservedBookWithQueue = mergeBook<ReservedBook>({
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
    setup(<FulfillmentCard book={reservedBookWithQueue} />);
    expect(screen.getByText("5 patrons ahead of you in the queue."))
      .toBeInTheDocument;
  });
});

describe("FulfillableBook", () => {
  beforeEach(() => mockConfig({ companionApp: "simplye" }));

  const downloadableBook = mergeBook<FulfillableBook>({
    status: "fulfillable",
    revokeUrl: "/revoke",
    fulfillmentLinks: [
      {
        url: "/epub-link",
        contentType: "application/epub+zip",
        supportLevel: "show"
      },
      {
        url: "/pdf-link",
        contentType: "application/pdf",
        supportLevel: "show"
      }
    ],
    availability: {
      status: "available",
      until: "2020-06-18"
    }
  });

  const viewableAxisNowBook = mergeBook<FulfillableBook>({
    status: "fulfillable",
    revokeUrl: "/revoke",
    fulfillmentLinks: [
      {
        url: "/epub-link",
        contentType: "application/vnd.librarysimplified.axisnow+json",
        supportLevel: "show"
      }
    ],
    availability: {
      status: "available",
      until: "2020-06-18"
    }
  });

  test("displays return button that calls apropriate url", async () => {
    const unborrowed = mergeBook<BorrowableBook>({
      status: "borrowable",
      borrowUrl: "/borrow"
    });
    mockFetchBook.mockResolvedValue(unborrowed);
    setup(<FulfillmentCard book={downloadableBook} />);
    const revokeButton = await screen.findByRole("button", {
      name: "Return"
    });
    expect(revokeButton).toBeInTheDocument();

    fireEvent.click(revokeButton);

    expect(
      await screen.findByRole("button", { name: "Returning..." })
    ).toBeInTheDocument();

    expect(mockFetchBook).toHaveBeenCalledWith(
      "/revoke",
      "http://test-cm.com/catalogUrl",
      "user-token"
    );

    expect(mockSetBook).toHaveBeenCalledWith(unborrowed, downloadableBook.id);
  });

  test("constructs link to viewer for OpenAxis Books", async () => {
    mockConfig({ companionApp: "openebooks" });
    (env as any).AXISNOW_DECRYPT = "true";

    setup(<FulfillmentCard book={viewableAxisNowBook} />);
    const readerButton = await screen.findByRole("button", {
      name: /Read/i
    });

    expect(mockPush).toHaveBeenCalledTimes(0);
    fireEvent.click(readerButton);
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  test("shows read online button for external read online links", async () => {
    const readOnlineBook = mergeBook<FulfillableBook>({
      status: "fulfillable",
      revokeUrl: "/revoke",
      fulfillmentLinks: [
        {
          url: "/overdrive-read-online",
          contentType: `text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"`,
          supportLevel: "show"
        }
      ]
    });
    setup(<FulfillmentCard book={readOnlineBook} />);

    const readOnline = await screen.findByRole("button", {
      name: "Read Online"
    });
    expect(readOnline).toBeInTheDocument();
  });

  test("external read online tracks open_book event", async () => {
    const readOnlineBook = mergeBook<FulfillableBook>({
      status: "fulfillable",
      revokeUrl: "/revoke",
      trackOpenBookUrl: "http://track-open-book.com",
      fulfillmentLinks: [
        {
          url: "/overdrive-read-online",
          contentType: `text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"`,
          supportLevel: "show"
        }
      ]
    });
    setup(<FulfillmentCard book={readOnlineBook} />);
    const readOnline = await screen.findByRole("button", {
      name: "Read Online"
    });

    // no calls until we click the button
    expect(fetchMock).toHaveBeenCalledTimes(0);
    fireEvent.click(readOnline);
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("http://track-open-book.com")
    );
  });

  test("internal read online button tracks open_book event", async () => {
    (env as any).AXISNOW_DECRYPT = "true";
    const readOnlineBook = mergeBook<FulfillableBook>({
      status: "fulfillable",
      revokeUrl: "/revoke",
      trackOpenBookUrl: "http://track-open-book.com",
      fulfillmentLinks: [
        {
          url: "/internal-read-online",
          contentType: "application/vnd.librarysimplified.axisnow+json",
          supportLevel: "show"
        }
      ]
    });
    setup(<FulfillmentCard book={readOnlineBook} />);
    const readOnline = await screen.findByRole("button", { name: "Read" });

    // should not have been called ever
    expect(fetchMock).toHaveBeenCalledTimes(0);
    fireEvent.click(readOnline);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("http://track-open-book.com")
    );
  });

  test("correct title and subtitle without redirect", () => {
    setup(<FulfillmentCard book={downloadableBook} />);
    expect(screen.getByText("Ready to Read!")).toBeInTheDocument();
    expect(
      screen.getByText(`You have this book on loan until ${MOCK_DATE_STRING}.`)
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Ready to Read in Palace!")
    ).not.toBeInTheDocument();
  });
  const bookWithRedirect = mergeBook<FulfillableBook>({
    status: "fulfillable",
    revokeUrl: "/revoke",
    fulfillmentLinks: [
      {
        contentType: "application/epub+zip",
        url: "/epub",
        supportLevel: "redirect-and-show"
      }
    ]
  });
  test("correct title and subtitle with companion app redirect", () => {
    mockConfig({
      companionApp: "simplye"
    });
    setup(<FulfillmentCard book={bookWithRedirect} />);
    expect(screen.queryByText("Ready to Read!")).not.toBeInTheDocument();
    expect(screen.getByText("Ready to Read in Palace!")).toBeInTheDocument();
    expect(
      screen.getByText("If you would rather read on your computer, you can:")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download EPUB" }));
  });

  test("correct title and subtitle when COMPANION_APP is set to openebooks", () => {
    mockConfig({ companionApp: "openebooks" });
    setup(<FulfillmentCard book={bookWithRedirect} />);
    expect(
      screen.getByText("Ready to Read in Open eBooks!")
    ).toBeInTheDocument();
  });

  test("handles lack of availability info", () => {
    const withoutAvailability = mergeBook<FulfillableBook>({
      ...downloadableBook,
      availability: undefined
    });
    setup(<FulfillmentCard book={withoutAvailability} />);
    expect(screen.getByText("Ready to Read!")).toBeInTheDocument();
  });

  test("shows download options", async () => {
    setup(<FulfillmentCard book={downloadableBook} />);
    const downloadButton = await screen.findByText("Download EPUB");
    expect(downloadButton).toBeInTheDocument();

    const PDFButton = await screen.findByText("Download PDF");
    expect(PDFButton).toBeInTheDocument();
  });

  test("download button shows loading indicator fetches book", async () => {
    setup(<FulfillmentCard book={downloadableBook} />);
    const downloadButton = screen.getByText("Download EPUB");
    expect(downloadButton).toBeInTheDocument();

    fireEvent.click(downloadButton);

    // expect(
    //   screen.getByRole("button", { name: /downloading\.\.\./i })
    // ).toBeInTheDocument();
    expect(downloadButton).toHaveTextContent(/downloading\.\.\./i);

    await waitForElementToBeRemoved(() => screen.queryByText("Downloading..."));
    // expect(screen.queryByText("Downloading...")).not.toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledWith("/epub-link", {
      headers: {
        Authorization: "user-token",
        "X-Requested-With": "XMLHttpRequest"
      }
    });
  });

  test("download button fetches opds entry to indirectly fulfill book", async () => {
    const bookWithIndirect = mergeBook<FulfillableBook>({
      ...downloadableBook,
      fulfillmentLinks: [
        {
          url: "/indirect",
          indirectionType:
            "application/atom+xml;type=entry;profile=opds-catalog",
          contentType:
            'text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"',
          supportLevel: "show"
        }
      ]
    });

    setup(<FulfillmentCard book={bookWithIndirect} />);
    const downloadButton = await screen.findByText("Read Online");
    expect(downloadButton).toBeInTheDocument();

    fireEvent.click(downloadButton);

    // you fetch the opds entry which should then return you a book with the correct link
    expect(fetchMock).toHaveBeenCalledWith("/indirect", {
      headers: {
        Authorization: "user-token",
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    // some error will be shown because we didn't mock fetch for this,
    // and we need to await it or our test will
    // warn about the unexpected promise.
    await screen.findByText(/error:/i);
  });

  test("shows download error message", async () => {
    const problem: ProblemDocument = {
      detail: "You can't do that",
      title: "Wrong!",
      status: 418
    };
    fetchMock.once(JSON.stringify(problem), { status: 418 });
    setup(<FulfillmentCard book={downloadableBook} />);
    const downloadButton = await screen.findByText("Download EPUB");

    fireEvent.click(downloadButton);

    expect(
      await screen.findByText("Error: You can't do that")
    ).toBeInTheDocument();
  });

  test("reattempts downloads without headers upon redirect failure", async () => {
    // redirect the user
    fetchMock.once("Bad headers dude!", {
      status: 301,
      // this is a little known feature to mock a redirected response
      counter: 1,
      url: "/new-location"
    } as any);
    setup(<FulfillmentCard book={downloadableBook} />);
    const downloadButton = await screen.findByText("Download EPUB");

    fireEvent.click(downloadButton);

    await waitForElementToBeRemoved(() => screen.queryByText("Downloading..."));
    expect(screen.queryByText("Downloading...")).not.toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledWith("/epub-link", {
      headers: {
        Authorization: "user-token",
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    // we try the rejected url without headers
    expect(fetchMock).toHaveBeenCalledWith("/new-location");
  });
});

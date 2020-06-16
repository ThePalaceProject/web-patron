import * as React from "react";
import {
  render,
  fixtures,
  actions,
  within,
  waitFor
} from "../../../test-utils";
import merge from "deepmerge";
import FulfillmentCard from "../FulfillmentCard";
import {
  BookData,
  MediaType,
  FetchErrorData
} from "opds-web-client/lib/interfaces";
import userEvent from "@testing-library/user-event";
import { State } from "opds-web-client/lib/state";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import moment from "moment";

jest.mock("moment", () => () => ({
  fromNow: () => "two days"
}));

const makeBook = (data: Partial<BookData>) =>
  merge<BookData>(fixtures.book, data, {
    arrayMerge: (_a, b) => b
  });

describe("open-access", () => {
  test("correct title and subtitle", () => {
    const node = render(<FulfillmentCard book={fixtures.book} />);
    expect(
      node.getByText("This open-access book is available to keep forever.")
    ).toBeInTheDocument();
    expect(node.getByText("You're ready to read this book in SimplyE!"));
  });
  test("shows download options", () => {
    const node = render(<FulfillmentCard book={fixtures.book} />);
    expect(
      node.getByText("If you would rather read on your computer, you can:")
    );
    const downloadButton = node.getByText("Download EPUB");
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveAttribute("target", "__blank");
    expect(downloadButton).toHaveAttribute("href", "/epub-open-access-link");

    const PDFButton = node.getByText("Download PDF");
    expect(PDFButton).toBeInTheDocument();
    expect(PDFButton).toHaveAttribute("target", "__blank");
    expect(PDFButton).toHaveAttribute("href", "/pdf-open-access-link");
  });
  test("doesn't show duplicate download options", () => {
    const bookWithDuplicateFormat = makeBook({
      openAccessLinks: [
        ...fixtures.book.openAccessLinks,
        {
          type: "application/pdf",
          url: "/pdf-open-access-link-2"
        },
        {
          type: "application/pdf",
          url: "/pdf-open-access-link-3"
        }
      ]
    });
    const node = render(<FulfillmentCard book={bookWithDuplicateFormat} />);
    const downloadButton = node.getAllByText("Download PDF");
    expect(downloadButton).toHaveLength(1);
  });
});
describe("available to borrow", () => {
  const closedAccessBook = makeBook({
    openAccessLinks: [],
    copies: {
      total: 13,
      available: 10
    }
  });
  test("correct title and subtitle", () => {
    const node = render(<FulfillmentCard book={closedAccessBook} />);
    expect(
      node.getByText("This book is available to borrow!")
    ).toBeInTheDocument();
    expect(node.getByText("10 out of 13 copies available."));
  });
  test("displays borrow button", () => {
    const node = render(<FulfillmentCard book={closedAccessBook} />);
    const borrowButton = node.getByText("Borrow");
    expect(borrowButton).toBeInTheDocument();
  });

  test("shows loading state when borrowing, borrows, and refetches loans", async () => {
    // mock the actions.updateBook
    const updateBookSpy = jest
      .spyOn(actions, "updateBook")
      .mockImplementation(_url => _dispatch =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve(fixtures.book);
          }, 200);
        })
      );
    // also spy on fetchLoans
    const fetchLoansSpy = jest.spyOn(actions, "fetchLoans");
    const node = render(<FulfillmentCard book={closedAccessBook} />, {
      initialState: merge<State>(fixtures.initialState, {
        loans: {
          url: "/loans-url",
          books: []
        }
      })
    });
    // click borrow
    userEvent.click(node.getByText("Borrow"));
    expect(updateBookSpy).toHaveBeenCalledTimes(1);
    expect(updateBookSpy).toHaveBeenCalledWith("borrow url");
    const borrowButton = await node.findByRole("button", {
      name: "Borrowing..."
    });
    expect(borrowButton).toBeInTheDocument();
    expect(borrowButton).toBeDisabled();
    // we should refetch the loans after borrowing
    await waitFor(() => expect(fetchLoansSpy).toHaveBeenCalledTimes(1));
  });

  test("displays error message", () => {
    const err: FetchErrorData = {
      response: "cannot loan more than 3 documents.",
      status: 403,
      url: "error-url"
    };
    const node = render(<FulfillmentCard book={closedAccessBook} />, {
      initialState: merge(fixtures.initialState, {
        book: {
          error: err
        }
      })
    });
    expect(
      node.getByText("10 out of 13 copies available.")
    ).toBeInTheDocument();
    expect(
      node.getByText("Error: cannot loan more than 3 documents.")
    ).toBeInTheDocument();
  });
});

describe("available to reserve", () => {
  const unavailableBook = makeBook({
    openAccessLinks: [],
    copies: {
      total: 13,
      available: 0
    }
  });

  test("correct title and subtitle", () => {
    const node = render(<FulfillmentCard book={unavailableBook} />);
    expect(
      node.getByText("This book is currently unavailable.")
    ).toBeInTheDocument();
    expect(node.getByText("0 out of 13 copies available.")).toBeInTheDocument();
  });

  test("displays reserve button", () => {
    const node = render(<FulfillmentCard book={unavailableBook} />);
    const reserveButton = node.getByRole("button", { name: "Reserve" });
    expect(reserveButton).toBeInTheDocument();
  });

  test("shows number of patrons in queue when holds info present", () => {
    const bookWithQueue = makeBook({
      openAccessLinks: [],
      copies: {
        total: 13,
        available: 0
      },
      holds: {
        total: 4
      }
    });
    const node = render(<FulfillmentCard book={bookWithQueue} />);
    expect(
      node.getByText("0 out of 13 copies available. 4 patrons in the queue.")
    );
  });

  test("doesn't show patrons in queue when holds info no present", () => {
    const node = render(<FulfillmentCard book={unavailableBook} />);
    expect(node.getByText("0 out of 13 copies available.")).toBeInTheDocument();
  });

  test("handles unknown availability numbers", () => {
    const bookWithQueue = makeBook({
      openAccessLinks: [],
      copies: undefined
    });
    // this is currently failing because the getFulfillmentState is returning error
    // since we expect to always have the availability numbers otherwise we don't know
    // if the book is available or not, unless there is some other way to tell that state.
    const node = render(<FulfillmentCard book={bookWithQueue} />);
    expect(node.getByText("Number of books available is unknown."));
  });
});

describe("reserved", () => {
  const reservedBook = makeBook({
    availability: {
      status: "reserved"
    },
    openAccessLinks: [],
    copies: {
      total: 13,
      available: 0
    }
  });

  test("displays disabled reserve button", () => {
    const node = render(<FulfillmentCard book={reservedBook} />);
    const reserveButton = node.getByText("Reserved");
    expect(reserveButton).toBeInTheDocument();
    expect(reserveButton).toBeDisabled();
  });

  test("displays number of patrons in queue and your position", () => {
    const reservedBookWithQueue = makeBook({
      availability: {
        status: "reserved"
      },
      openAccessLinks: [],
      copies: {
        total: 13,
        available: 0
      },
      holds: {
        total: 23,
        position: 5
      }
    });
    const node = render(<FulfillmentCard book={reservedBookWithQueue} />);
    expect(node.getByText("Your hold position is: 5.")).toBeInTheDocument;
  });

  describe("borrowed", () => {
    const borrowedBook = makeBook({
      openAccessLinks: [],
      fulfillmentLinks: [
        {
          type: "application/pdf" as MediaType,
          url: "/pdf-fulfillment-link",
          indirectType: "indirect-type"
        },
        {
          type: "application/epub+zip" as MediaType,
          url: "/epub-fulfillment-link",
          indirectType: "indirect-type"
        }
      ],
      copies: {
        total: 13,
        available: 0
      }
    });

    test("download button calls fulfillBook", () => {
      const fulfillBookSpy = jest.spyOn(actions, "fulfillBook");

      const node = render(<FulfillmentCard book={borrowedBook} />);
      const downloadButton = node.getByText("Download");
      expect(downloadButton).toBeInTheDocument();

      userEvent.click(downloadButton);

      expect(fulfillBookSpy).toHaveBeenCalledTimes(1);
      expect(fulfillBookSpy).toHaveBeenCalledWith("/pdf-fulfillment-link");
    });

    test("shows time left when possible", () => {
      const withAvailabilityUntil = makeBook({
        openAccessLinks: [],
        fulfillmentLinks: [
          {
            type: "application/pdf" as MediaType,
            url: "/pdf-fulfillment-link",
            indirectType: "indirect-type"
          },
          {
            type: "application/epub+zip" as MediaType,
            url: "/epub-fulfillment-link",
            indirectType: "indirect-type"
          }
        ],
        copies: {
          total: 13,
          available: 0
        },
        availability: {
          until: "2020-07-11",
          status: "borrowed"
        }
      });
      const node = render(<FulfillmentCard book={withAvailabilityUntil} />);

      expect(node.getByText("You have this book on loan for two days"));
    });

    test("handles no availability.until data", () => {
      const node = render(<FulfillmentCard book={borrowedBook} />);

      expect(node.getByText("You have this book on loan."));
    });

    test("allows selecting type", () => {
      const node = render(<FulfillmentCard book={borrowedBook} />);
      const typeSelector = node.getByLabelText("TYPE");
      expect(within(typeSelector).getByText("PDF")).toBeInTheDocument();
      expect(within(typeSelector).getByText("EPUB")).toBeInTheDocument();
    });
  });
});

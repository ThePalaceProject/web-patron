import * as React from "react";
import { fixtures, setup, screen } from "test-utils";
import { BookList, InfiniteBookList } from "../BookList";
import merge from "deepmerge";
import { BorrowableBook, CollectionData } from "interfaces";
import useSWRInfinite from "swr/infinite";
import { fetchCollection } from "dataflow/opds1/fetch";

const books = fixtures.makeBorrowableBooks(3);

test("renders books", () => {
  setup(<BookList books={books} />);

  function expectBook(i: number) {
    const book = fixtures.makeBook(i);
    expect(screen.getByText(book.title)).toBeInTheDocument();
    // shows details as well
    expect(screen.getByText("Book 0 author")).toBeInTheDocument();
  }

  expectBook(0);
  expectBook(1);
  expectBook(2);
});

test("truncates long titles", () => {
  const longBook = merge<BorrowableBook>(fixtures.book, {
    status: "borrowable",
    borrowUrl: "/borrow",
    title: "This is an extremely long title it's really way too long"
  });
  setup(<BookList books={[longBook]} />);

  const title = screen.getByText(
    /This is an extremely long title it's really way.../i
  );

  // 57 is expected because "Title:" is prepended but hidden visually
  expect(title.textContent).toHaveLength(57);
});

test("truncates authors", () => {
  const longBook = merge<BorrowableBook>(
    fixtures.book,
    {
      status: "borrowable",
      borrowUrl: "/borrow",
      authors: ["one", "two", "three", "four", "five"]
    },
    {
      arrayMerge: (a, b) => b
    }
  );
  setup(<BookList books={[longBook]} />);

  expect(screen.getByText("one, two, & 3 more"));
  expect(screen.queryByText("one, two, three")).toBeFalsy();
});

test("show return button for fulfillable book", () => {
  setup(<BookList books={[fixtures.fulfillableBook]} />);
  const button = screen.getByRole("button", { name: "Return" });
  expect(button).toBeInTheDocument();
});

jest.mock("swr/infinite");
const useSWRInfiniteMock = useSWRInfinite as jest.MockedFunction<
  typeof useSWRInfinite
>;

function mockCollection(data?: CollectionData[]) {
  useSWRInfiniteMock.mockReturnValue({
    size: 0,
    setSize: jest.fn(),
    data: data
  } as any);
}

describe("infinite loading book list", () => {
  test("fetches collection", () => {
    mockCollection();
    setup(<InfiniteBookList firstPageUrl="/first-page" />);

    expect(useSWRInfinite).toHaveBeenCalledWith(
      expect.anything(),
      fetchCollection
    );
  });

  test("properly extracts books from array of collections", () => {
    mockCollection([
      {
        ...fixtures.emptyCollection,
        books: fixtures.makeBorrowableBooks(2)
      },
      {
        ...fixtures.emptyCollection,
        id: "id-2",
        books: [fixtures.borrowableBook]
      }
    ]);
    setup(<InfiniteBookList firstPageUrl="/first-page" />);

    expect(
      screen.getAllByRole("link", { name: "Book Title 0 - details page" })
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("link", { name: "Book Title 1 - details page" })
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("link", { name: "The Mayan Secrets - details page" })
    ).toHaveLength(2);
  });

  test("shows loading indicator when fetching more", () => {
    const notFinalCollection: CollectionData = {
      books: [fixtures.borrowableBook],
      id: "id!",
      lanes: [],
      navigationLinks: [],
      title: "last collection",
      url: "http://last.com",
      nextPageUrl: "http://next-page.com",
      searchDataUrl: "/search-data-url"
    };
    useSWRInfiniteMock.mockReturnValue({
      size: 2,
      setSize: jest.fn(),
      data: [notFinalCollection]
    } as any);
    setup(<InfiniteBookList firstPageUrl="/first-page" />);

    expect(screen.getByText("Loading ...")).toBeInTheDocument();
  });

  test("doesn't show loader when at end of list", () => {
    const finalCollection: CollectionData = {
      books: [fixtures.borrowableBook],
      id: "id!",
      lanes: [],
      navigationLinks: [],
      title: "last collection",
      url: "http://last.com",
      searchDataUrl: "/search-data-url"
      // no nextPageUrl
    };
    useSWRInfiniteMock.mockReturnValue({
      size: 2,
      setSize: jest.fn(),
      data: [finalCollection]
    } as any);

    setup(<InfiniteBookList firstPageUrl="http://first-page.com" />);

    expect(screen.getByText("The Mayan Secrets")).toBeInTheDocument();

    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  test("shows view more button which loads more books on click", async () => {
    const notFinalCollection: CollectionData = {
      books: [fixtures.borrowableBook],
      id: "id!",
      lanes: [],
      navigationLinks: [],
      title: "last collection",
      url: "http://last.com",
      nextPageUrl: "http://next-page.com",
      searchDataUrl: "/search-data-url"
    };
    const mockSetSize = jest.fn();
    useSWRInfiniteMock.mockReturnValue({
      size: 1,
      setSize: mockSetSize,
      data: [notFinalCollection]
    } as any);
    const { user } = setup(<InfiniteBookList firstPageUrl="/first-page" />);

    const viewMore = screen.getByRole("button", {
      name: "View more"
    });

    expect(viewMore).toBeInTheDocument();

    // click it and you should fetch more
    expect(mockSetSize).toHaveBeenCalledTimes(0);
    await user.click(viewMore);
    expect(mockSetSize).toHaveBeenCalledTimes(1);
  });
});

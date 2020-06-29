import * as React from "react";
import { render, fixtures } from "test-utils";
import { ListView } from "../BookList";
import merge from "deepmerge";
import { BookData } from "opds-web-client/lib/interfaces";

const books = fixtures.makeBooks(3);

test("renders books", () => {
  const node = render(<ListView books={books} />);

  function expectBook(i: number) {
    const book = fixtures.makeBook(i);
    expect(node.getByText(book.title)).toBeInTheDocument();
    // shows details as well
    expect(node.getByText(book.authors[0])).toBeInTheDocument();
  }

  expectBook(0);
  expectBook(1);
  expectBook(2);
});

test("truncates long titles", () => {
  const longBook = merge<BookData>(fixtures.book, {
    title: "This is an extremely long title it's really way too long"
  });
  const node = render(<ListView books={[longBook]} />);

  const title = node.getByText(/This is an extremely/i);
  expect(title.textContent).toHaveLength(50);
});

test("truncates authors", () => {
  const longBook = merge<BookData>(
    fixtures.book,
    {
      authors: ["one", "two", "three", "four", "five"]
    },
    {
      arrayMerge: (a, b) => b
    }
  );
  const node = render(<ListView books={[longBook]} />);

  expect(node.getByText("one, two & 3 more"));
  expect(node.queryByText("one, two, three")).toBeFalsy();
});

import * as React from "react";
import { render, fixtures } from "../../test-utils";
import { GalleryView } from "../BookList";

const books = fixtures.makeBooks(3);

/**
 * - includes breadcrumbs bar
 * - works with borrow button and without
 * - allows adding custom breadcrumb child
 */
test("renders books", () => {
  const node = render(<GalleryView books={books} />);

  function expectBook(i: number) {
    const book = fixtures.makeBook(i);
    const bookNode = node.getByText(book.title);
    expect(bookNode).toBeInTheDocument();
    expect(bookNode?.closest("a")).toHaveAttribute("href", `/book${book.url}`);
  }

  expectBook(0);
  expectBook(1);
  expectBook(2);
});

test("includes breadcrumb children", () => {
  const node = render(
    <GalleryView books={books} breadcrumb={<div>Hi from breadcrumb</div>} />
  );
  expect(node.getByText("Hi from breadcrumb")).toBeInTheDocument();
});

test("displays borrow button when told to", () => {
  const node = render(<GalleryView books={books} showBorrowButton />);
  const borrowButtons = node.getAllByText("Borrow");
  expect(borrowButtons).toHaveLength(3);
});

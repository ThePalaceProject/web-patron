import React from "react";
import { StoryFn, Meta } from "@storybook/react";
import { borrowableBook } from "test-utils/fixtures/book";
import { BookListItem } from "components/BookList";
import { AnyBook } from "interfaces";

export default {
  title: "Components/BookListItem/Borrowable",
  component: BookListItem
} as Meta;

const Template: StoryFn<{ book: AnyBook }> = args => <BookListItem {...args} />;

export const BorrowableBook = Template.bind({});
BorrowableBook.args = {
  book: borrowableBook
};

export const WithAvailability = Template.bind({});
WithAvailability.args = {
  book: {
    ...borrowableBook,
    copies: {
      available: 50,
      total: 100
    }
  }
};

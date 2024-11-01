import React from "react";
import { StoryFn, Meta } from "@storybook/react";
import { reservableBook } from "test-utils/fixtures/book";
import { BookListItem } from "components/BookList";
import { AnyBook } from "interfaces";

export default {
  title: "Components/BookListItem/Reservable",
  component: BookListItem
} as Meta;

const Template: StoryFn<{ book: AnyBook }> = args => <BookListItem {...args} />;

export const ReservableBook = Template.bind({});
ReservableBook.args = {
  book: reservableBook
};

export const WithAvailability = Template.bind({});
WithAvailability.args = {
  book: {
    ...reservableBook,
    copies: {
      available: 0,
      total: 15
    },
    holds: {
      total: 3
    }
  }
};

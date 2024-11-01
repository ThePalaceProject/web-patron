import React from "react";
import { StoryFn, Meta } from "@storybook/react";
import { reservedBook } from "test-utils/fixtures/book";
import { BookListItem } from "components/BookList";
import { AnyBook } from "interfaces";

export default {
  title: "Components/BookListItem/Reserved",
  component: BookListItem
} as Meta;

const Template: StoryFn<{ book: AnyBook }> = args => <BookListItem {...args} />;

export const ReservedBook = Template.bind({});
ReservedBook.args = {
  book: reservedBook
};

export const WithAvailability = Template.bind({});
WithAvailability.args = {
  book: {
    ...reservedBook,
    copies: {
      available: 0,
      total: 15
    },
    holds: {
      total: 3,
      position: 1
    }
  }
};

export const WithoutRevokeUrl = Template.bind({});
WithoutRevokeUrl.args = {
  book: {
    ...reservedBook,
    revokeUrl: null,
    copies: {
      available: 0,
      total: 15
    },
    holds: {
      total: 3,
      position: 1
    }
  }
};

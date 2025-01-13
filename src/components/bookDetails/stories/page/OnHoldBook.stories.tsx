import React from "react";
import { StoryFn, Meta } from "@storybook/react";
import { onHoldBook } from "test-utils/fixtures/book";
import BookPage from "components/bookDetails";

export default {
  title: "Pages/Book/OnHold",
  component: BookPage
} as Meta;

const Template: StoryFn = args => <BookPage {...args} />;

export const OnHoldBook = Template.bind({});
OnHoldBook.parameters = {
  config: {
    companionApp: "openebooks"
  },
  swr: {
    data: onHoldBook
  }
};

export const WithAvailability = Template.bind({});
WithAvailability.parameters = {
  ...OnHoldBook.parameters,
  swr: {
    data: {
      ...onHoldBook,
      availability: {
        until: "10/20/1980"
      }
    }
  }
};

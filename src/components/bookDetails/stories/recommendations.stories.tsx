import * as React from "react";
import { action } from "@storybook/addon-actions";
import Recommendations from "../recommendations";
import { bookFixture } from "../../../__tests__/fixtures/book";

export default {
  component: Recommendations,
  title: "Book Details/Recommendations"
};

const bookWithoutRecs = { ...bookFixture };

export const EmptyRecommendations = () => (
  <Recommendations book={bookWithoutRecs} />
);

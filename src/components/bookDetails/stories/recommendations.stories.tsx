import * as React from "react";
import { action } from "@storybook/addon-actions";
import Recommendations from "../recommendations";
import { bookFixture } from "../../../test-utils/fixtures/book";
import { RecommendationsStateContext } from "../../context/RecommendationsContext";
import { recommendationsState } from "../../../test-utils/fixtures/recommendationsState";
import { LaneData, CollectionData } from "opds-web-client/lib/interfaces";
import { RecommendationsState } from "src/interfaces";

export default {
  component: Recommendations,
  title: "Book Details/Recommendations"
};

const bookWithoutRecs = { ...bookFixture };

export const EmptyRecommendations = () => (
  <Recommendations book={bookWithoutRecs} />
);

const bookWithRecs = { ...bookFixture };
export const WithRecommendations = () => (
  <Recommendations book={bookWithRecs} />
);
WithRecommendations.story = {
  decorators: [
    storyFn => (
      <RecommendationsStateContext.Provider value={recommendationsState}>
        {storyFn()}
      </RecommendationsStateContext.Provider>
    )
  ]
};

const lanes = recommendationsState.data?.lanes ?? [];
const manyLanes = [...lanes, ...lanes, ...lanes, ...lanes];
const recommendationsWithManyLanes: RecommendationsState = {
  ...recommendationsState,
  data: { ...(recommendationsState.data as CollectionData), lanes: manyLanes }
};
export const WithManyLanes = () => <Recommendations book={bookWithRecs} />;
WithManyLanes.story = {
  decorators: [
    storyFn => (
      <RecommendationsStateContext.Provider
        value={recommendationsWithManyLanes}
      >
        {storyFn()}
      </RecommendationsStateContext.Provider>
    )
  ]
};

const books = lanes[0].books;
const recommendationsWithManyBooks: RecommendationsState = {
  ...recommendationsState,
  data: {
    ...(recommendationsState.data as CollectionData),
    lanes: [
      {
        ...lanes[0],
        books: [...books, ...books, ...books, ...books]
      }
    ]
  }
};
export const WithManyBooks = () => <Recommendations book={bookWithRecs} />;
WithManyBooks.story = {
  decorators: [
    storyFn => (
      <RecommendationsStateContext.Provider
        value={recommendationsWithManyBooks}
      >
        {storyFn()}
      </RecommendationsStateContext.Provider>
    )
  ]
};

export const Fetching = () => <Recommendations book={bookWithRecs} />;
Fetching.story = {
  decorators: [
    storyFn => (
      <RecommendationsStateContext.Provider
        value={{ ...recommendationsState, isFetching: true }}
      >
        {storyFn()}
      </RecommendationsStateContext.Provider>
    )
  ]
};

import * as React from "react";
import { render, fixtures, fireEvent } from "../../test-utils";
import { Collection } from "../Collection";
import merge from "deepmerge";
import { State } from "opds-web-client/lib/state";
import { LaneData } from "opds-web-client/lib/interfaces";
import Layout from "../Layout";
import { useBreakpointIndex } from "@theme-ui/match-media";

const setCollectionAndBook = jest.fn().mockResolvedValue({});

beforeEach(() => {
  /**
   * We do this because Lane does use timeouts, so we need to be
   * sure they are mocked or we get nebulous errors
   */
  jest.useFakeTimers();
});

test("calls setCollectionAndBook", () => {
  render(<Collection setCollectionAndBook={setCollectionAndBook} />);

  expect(setCollectionAndBook).toHaveBeenCalledTimes(1);
});

test("displays loader", () => {
  const node = render(
    <Collection setCollectionAndBook={setCollectionAndBook} />,
    {
      initialState: merge(fixtures.initialState, {
        collection: {
          isFetching: true
        }
      })
    }
  );
  expect(node.getByText("Loading...")).toBeInTheDocument();
});

test("displays lanes when present", () => {
  const laneData: LaneData = {
    title: "my lane",
    url: "/link-to-lane",
    books: fixtures.makeBooks(10)
  };
  const initialState: State = merge(fixtures.initialState, {
    collection: {
      data: {
        books: [],
        lanes: [laneData]
      }
    }
  });
  const node = render(
    <Collection setCollectionAndBook={setCollectionAndBook} />,
    {
      initialState
    }
  );

  // expect there to be a lane with books
  const laneTitle = node.getByText("my lane");
  expect(laneTitle).toBeInTheDocument();
  expect(node.getByText(fixtures.makeBook(0).title)).toBeInTheDocument();
  expect(
    node.getByText(fixtures.makeBook(0).authors.join(", "))
  ).toBeInTheDocument();
});

test("prefers lanes over books", () => {
  const laneData: LaneData = {
    title: "my lane",
    url: "/link-to-lane",
    books: fixtures.makeBooks(10)
  };
  const initialState: State = merge(fixtures.initialState, {
    collection: {
      data: {
        books: fixtures.makeBooks(10),
        lanes: [laneData]
      }
    }
  });
  const node = render(
    <Collection setCollectionAndBook={setCollectionAndBook} />,
    {
      initialState
    }
  );

  // expect the lane title to be rendered, indicating it chose
  // lanes over books
  const laneTitle = node.getByText("my lane");
  expect(laneTitle).toBeInTheDocument();
});

test("renders books in list view if no lanes", () => {
  const initialState: State = merge(fixtures.initialState, {
    collection: {
      data: {
        books: fixtures.makeBooks(10),
        lanes: null
      }
    }
  });
  const node = render(
    <Collection setCollectionAndBook={setCollectionAndBook} />,
    {
      initialState
    }
  );

  const list = node.getByTestId("listview-list");
  expect(list).toBeInTheDocument();
  expect(node.getByText(fixtures.makeBook(0).title)).toBeInTheDocument();
  expect(
    node.getByText(fixtures.makeBook(0).authors.join(", "))
  ).toBeInTheDocument();
});

test("renders empty state if no lanes or books", () => {
  const initialState: State = merge(fixtures.initialState, {
    collection: {
      data: {
        books: [],
        lanes: null
      }
    }
  });
  const node = render(
    <Collection setCollectionAndBook={setCollectionAndBook} />,
    {
      initialState
    }
  );

  expect(node.getByText("This collection is empty.")).toBeInTheDocument();
});

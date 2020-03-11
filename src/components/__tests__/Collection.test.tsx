import * as React from "react";
import { render, fixtures } from "../../test-utils";
import { Collection } from "../Collection";
import merge from "deepmerge";
import { State } from "opds-web-client/lib/state";
import { LaneData } from "opds-web-client/lib/interfaces";
//file.only

/**
 *  - calls set collection and book
 *  - subs in loaned book data if existing
 *
 *  - lanes
 *  -
 */

describe.only("collection", () => {
  const setCollectionAndBook = jest.fn().mockReturnValue(Promise.resolve({}));

  test("calls setCollectionAndBook", () => {
    const node = render(
      <Collection setCollectionAndBook={setCollectionAndBook} />
    );

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

  test.only("displays lanes when present", () => {
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

    // expect there to be lanes
  });
});

describe("gallery/list view selector", () => {
  test("Test Name", () => {
    expect(2).toEqual(1);
  });
});

describe("format filter", () => {
  test("Test Name", () => {
    expect(2).toEqual(1);
  });
});

describe("gallery sorters / filters", () => {
  test("Test Name", () => {
    expect(2).toEqual(1);
  });
});

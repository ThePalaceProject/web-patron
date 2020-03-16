import * as React from "react";
import { render, fixtures, fireEvent } from "../../test-utils";
import { Collection } from "../Collection";
import merge from "deepmerge";
import { State } from "opds-web-client/lib/state";
import { LaneData } from "opds-web-client/lib/interfaces";
import Layout from "../Layout";

const setCollectionAndBook = jest.fn().mockReturnValue(Promise.resolve({}));

test("renders books in list/gallery view if no lanes", () => {
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

  // the default display is gallery, so it should be in a gallery now
  const list = node.getByRole("list");
  expect(list).toHaveStyle("display: flex; flex-wrap: wrap;");
  expect(node.getByText(fixtures.makeBook(0).title)).toBeInTheDocument();
  expect(
    node.getByText(fixtures.makeBook(0).authors.join(", "))
  ).toBeInTheDocument();
});

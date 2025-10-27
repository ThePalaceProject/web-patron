import * as React from "react";
import { expect, test } from "@jest/globals";
import { render, fixtures } from "test-utils";
import BookCard from "components/BookCard";
import mockConfig from "test-utils/mockConfig";
import { FulfillableBook } from "interfaces";

const fulfillableBook = fixtures.mergeBook<FulfillableBook>({
  ...fixtures.book,
  status: "fulfillable",
  fulfillmentLinks: [],
  revokeUrl: "/revoke"
});

test("render accessible label for link within book card", () => {
  mockConfig();
  const utils = render(<BookCard book={fulfillableBook} />);

  expect(
    utils.getByRole("link", {
      name: "The Mayan Secrets - eBook, by Clive Cussler, Thomas Perry"
    })
  );
});

import * as React from "react";
import { render, fixtures } from "../../test-utils";
import merge from "deepmerge";
import { FacetGroupData, CollectionData } from "opds-web-client/lib/interfaces";
import PageTitle from "components/PageTitle";
import { State } from "opds-web-client/lib/state";
import userEvent from "@testing-library/user-event";
import { mockPush } from "test-utils/mockNextRouter";

const formatsFacet: FacetGroupData = {
  label: "Formats",
  facets: [
    {
      label: "eBooks",
      active: true,
      href: "/ebooks"
    },
    {
      label: "Audiobooks",
      href: "/audiobooks",
      active: false
    },
    {
      label: "All",
      href: "/all",
      active: false
    }
  ]
};

const collectionData: CollectionData = {
  ...fixtures.initialState.collection.data,
  facetGroups: [formatsFacet],
  title: "my lane",
  url: "/link-to-lane",
  id: "collection-id",
  books: [],
  navigationLinks: [],
  lanes: [
    {
      title: "my lane",
      url: "/link-to-lane",
      books: fixtures.makeBooks(10)
    }
  ]
};

const stateWithFacets: State = merge<State>(fixtures.initialState, {
  collection: {
    ...fixtures.initialState.collection,
    data: collectionData
  }
});

describe("Format filters", () => {
  test("Format filters not rendered when not in state", () => {
    const node = render(<PageTitle>Child</PageTitle>);
    expect(node.queryByLabelText("Format filters")).toBeFalsy();
    expect(node.queryByText("All")).toBeFalsy();
    expect(node.queryByLabelText("Books")).toBeFalsy();
    expect(node.queryByLabelText("Audiobooks")).toBeFalsy();
  });
  test("Format filters are visible in PageTitle w/ facets", () => {
    const node = render(<PageTitle>Child</PageTitle>, {
      initialState: stateWithFacets
    });
    expect(node.getByRole("option", { name: "All" })).toBeTruthy();
    expect(node.getByRole("option", { name: "eBooks" })).toBeTruthy();
    expect(node.getByRole("option", { name: "Audiobooks" })).toBeTruthy();
  });

  test("format filters navigate to respective urls", async () => {
    const node = render(<PageTitle>Child</PageTitle>, {
      initialState: stateWithFacets
    });

    const select = node.getByRole("combobox", {
      name: "Format"
    }) as HTMLSelectElement;
    // all is selected
    expect(select.value).toBe("/ebooks");

    // click works
    userEvent.selectOptions(select, "/all");
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      "/collection/[collectionUrl]",
      "/collection/all"
    );
  });
});

import * as React from "react";
import { render, fixtures } from "../../test-utils";
import ListFilters from "../ListFilters";
import merge from "deepmerge";
import { FacetGroupData } from "opds-web-client/lib/interfaces";
import { State } from "opds-web-client/lib/state";
import userEvent from "@testing-library/user-event";
/**
 * Sort by
 *  - has the right options
 *  - does redirect
 */
const stateWithFacets = (facets: FacetGroupData[]): State =>
  merge(fixtures.initialState, {
    collection: {
      data: {
        facetGroups: facets
      }
    }
  });

const sortByFacet: FacetGroupData = {
  label: "Sort by",
  facets: [
    {
      label: "author",
      href: "/author",
      active: true
    },
    {
      label: "title",
      href: "/title",
      active: false
    }
  ]
};

const availabilityFacet: FacetGroupData = {
  label: "Availability",
  facets: [
    {
      label: "All",
      href: "/all",
      active: true
    },
    {
      label: "Yours to keep",
      href: "/yours-to-keep",
      active: false
    },
    {
      label: "Available now",
      href: "/now",
      active: false
    }
  ]
};

test("renders sort by select with correct options", () => {
  const node = render(<ListFilters />, {
    initialState: stateWithFacets([sortByFacet])
  });

  const facet = node.getByLabelText("Sort by");
  expect(node.getByText("author")).toBeInTheDocument();
  expect(node.getByText("title")).toBeInTheDocument();

  expect(facet).toHaveValue("author");
});

test("renders availability select with correct options", () => {
  const node = render(<ListFilters />, {
    initialState: stateWithFacets([availabilityFacet])
  });

  const facet = node.getByLabelText("Availability");
  expect(node.getByText("All")).toBeInTheDocument();
  expect(node.getByText("Yours to keep")).toBeInTheDocument();
  expect(node.getByText("Available now")).toBeInTheDocument();

  expect(facet).toHaveValue("All");
});

// mock out the react router stuff
const mockPush = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: mockPush
  })
}));

test("does redirect when selected", () => {
  const node = render(<ListFilters />, {
    initialState: stateWithFacets([sortByFacet])
  });

  const facet = node.getByLabelText("Sort by");

  userEvent.selectOptions(facet, "title");

  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith("/collection/title");
});

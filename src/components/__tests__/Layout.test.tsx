import * as React from "react";
import { render, fixtures, logRoles, fireEvent } from "../../test-utils";
import Layout from "../Layout";
import { State } from "opds-web-client/lib/state";
import { FacetGroupData } from "opds-web-client/lib/interfaces";
import merge from "deepmerge";

/**
- [ ]  Clicking my books navigates
- [ ]  Format filters are visible (home, collection)
- [ ]  Clicking format filter navigates
- [ ]  Clicking home goes home
- Displays children
- Provides global styles
- Footer
 */

// file.only

test("Library name button navigates home", () => {
  const node = render(<Layout>Child</Layout>);
  const homeButton = node.getByText("Library System");

  // the home button should navigate to "/"
  expect(homeButton.closest("a")).toHaveAttribute("href", "/");
});

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

const stateWithFacets: State = merge(fixtures.initialState, {
  collection: {
    data: {
      facetGroups: [formatsFacet]
    }
  }
});
test("Format filters are visible on home w/ facets", () => {
  const node = render(<Layout>Child</Layout>, {
    route: "/",
    initialState: stateWithFacets
  });
  expect(node.getByText("ALL")).toBeTruthy();
  expect(node.getByLabelText("Books")).toBeTruthy();
  expect(node.getByLabelText("Audiobooks")).toBeTruthy();
});

test("format filters are visible on collection w/ facets present", () => {
  const node = render(<Layout>Child</Layout>, {
    route: "/collection/blah",
    initialState: stateWithFacets
  });
  expect(node.getByText("ALL")).toBeTruthy();
  expect(node.getByLabelText("Books")).toBeTruthy();
  expect(node.getByLabelText("Audiobooks")).toBeTruthy();
});

test("format filters are not visible if facets arent present", () => {
  const node = render(<Layout>Child</Layout>, {
    route: "/collection/blah",
    // should render collection.data = null
    initialState: undefined
  });

  expect(node.queryByText("ALL")).toBeNull();
  expect(node.queryByLabelText("Books")).toBeNull();
  expect(node.queryByLabelText("Audiobooks")).toBeNull();
});

test("format filters navigate to respective urls", () => {
  const node = render(<Layout>Child</Layout>, {
    route: "/collection/blah",
    initialState: stateWithFacets
  });

  expect(node.queryByText("ALL")?.closest("a")).toHaveAttribute("href", "/all");
  expect(node.queryByLabelText("Books")).toBeNull();
  expect(node.queryByLabelText("Audiobooks")).toBeNull();
});

test("format filter displays active state", () => {
  const node = render(<Layout>Child</Layout>, {
    route: "/collection/blah",
    initialState: stateWithFacets
  });

  expect(node.queryByText("ALL")).toBeNull();
  expect(node.queryByLabelText("Books")).toBeNull();
  expect(node.queryByLabelText("Audiobooks")).toBeNull();
});

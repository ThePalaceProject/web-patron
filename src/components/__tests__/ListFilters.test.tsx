import * as React from "react";
import { fixtures, screen, setup } from "test-utils";
import ListFilters from "../ListFilters";
import { CollectionData, FacetGroupData } from "interfaces";
import mockedRouter, { mockPush } from "test-utils/mockNextRouter";
import PageTitle from "components/PageTitle";

/**
 * Sort by
 *  - has the right options
 *  - does redirect
 */

const sortByFacet: FacetGroupData = {
  label: "Sort by",
  facets: [
    {
      label: "author",
      href: "http://author",
      active: true
    },
    {
      label: "title",
      href: "http://title",
      active: false
    }
  ]
};

const availabilityFacet: FacetGroupData = {
  label: "Availability",
  facets: [
    {
      label: "All",
      href: "http://all",
      active: true
    },
    {
      label: "Yours to keep",
      href: "http://yours-to-keep",
      active: false
    },
    {
      label: "Available now",
      href: "http://now",
      active: false
    }
  ]
};

const formatsFacet: FacetGroupData = {
  label: "Formats",
  facets: [
    {
      label: "eBooks",
      active: true,
      href: "http://ebooks"
    },
    {
      label: "Audiobooks",
      href: "http://audiobooks",
      active: false
    },
    {
      label: "All",
      href: "http://all",
      active: false
    }
  ]
};

const collectionWithFacets = (facets: FacetGroupData[]): CollectionData => ({
  id: "id",
  url: "url",
  title: "with facets",
  lanes: [],
  books: [],
  navigationLinks: [],
  facetGroups: facets,
  searchDataUrl: "/search-data-url"
});

test("renders sort by select with correct options", () => {
  setup(<ListFilters collection={collectionWithFacets([sortByFacet])} />);

  const facet = screen.getByLabelText("Sort by");
  expect(screen.getByText("author")).toBeInTheDocument();
  expect(screen.getByText("title")).toBeInTheDocument();

  expect(facet).toHaveValue("author");
});

test("renders availability select with correct options", () => {
  setup(<ListFilters collection={collectionWithFacets([availabilityFacet])} />);

  const facet = screen.getByLabelText("Availability");
  expect(screen.getByText("All")).toBeInTheDocument();
  expect(screen.getByText("Yours to keep")).toBeInTheDocument();
  expect(screen.getByText("Available now")).toBeInTheDocument();

  expect(facet).toHaveValue("All");
});

test("does redirect when selected", async () => {
  const { user } = setup(
    <ListFilters collection={collectionWithFacets([sortByFacet])} />
  );

  const facet = screen.getByLabelText("Sort by");

  await user.selectOptions(facet, "title");

  expect(mockedRouter.push).toHaveBeenCalledTimes(1);
  expect(mockedRouter.push).toHaveBeenCalledWith(
    "/testlib/collection/http%3A%2F%2Ftitle",
    undefined,
    {
      shallow: true
    }
  );
});

test("renders all facets when present", () => {
  setup(
    <ListFilters
      collection={collectionWithFacets([
        sortByFacet,
        availabilityFacet,
        formatsFacet
      ])}
    />
  );

  expect(screen.getByRole("combobox", { name: "Formats" })).toBeInTheDocument();
  expect(
    screen.getByRole("combobox", { name: "Availability" })
  ).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "Sort by" })).toBeInTheDocument();
});

const collectionWithFormats: CollectionData = {
  facetGroups: [formatsFacet],
  title: "my lane",
  url: "/link-to-lane",
  id: "collection-id",
  books: [],
  navigationLinks: [],
  searchDataUrl: "/search-data-url",
  lanes: [
    {
      title: "my lane",
      url: "/link-to-lane",
      books: fixtures.makeBorrowableBooks(10)
    }
  ]
};

describe("Format filters", () => {
  test("Format filters not rendered when not in state", () => {
    setup(<PageTitle>Child</PageTitle>);
    expect(screen.queryByLabelText("Format filters")).toBeFalsy();
    expect(screen.queryByText("All")).toBeFalsy();
    expect(screen.queryByLabelText("Books")).toBeFalsy();
    expect(screen.queryByLabelText("Audiobooks")).toBeFalsy();
  });
  test("Format filters are visible in PageTitle w/ facets", () => {
    setup(<PageTitle collection={collectionWithFormats}>Child</PageTitle>);
    expect(screen.getByRole("option", { name: "All" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "eBooks" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Audiobooks" })).toBeTruthy();
  });

  test("format filters navigate to respective urls", async () => {
    const { user } = setup(
      <PageTitle collection={collectionWithFormats}>Child</PageTitle>
    );

    const select = screen.getByRole("combobox", {
      name: "Formats"
    }) as HTMLSelectElement;
    // all is selected
    expect(select.value).toBe("eBooks");

    // click works
    await user.selectOptions(select, "All");
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      "/testlib/collection/http%3A%2F%2Fall",
      undefined,
      {
        shallow: true
      }
    );
  });
});

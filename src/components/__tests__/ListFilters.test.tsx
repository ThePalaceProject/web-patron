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

/**
 * Facet hrefs mirror what the circulation manager sends: every link in a group
 * carries the full facet state, and only the group's own parameter varies.
 * That varying parameter is how ListFilters identifies the group.
 */
const feed = (params: string) => `http://cm.test/feed?${params}`;
const collectionLink = (href: string) =>
  `/testlib/collection/${encodeURIComponent(href)}`;

const sortByAuthorHref = feed("available=all&order=author");
const sortByTitleHref = feed("available=all&order=title");

const sortByFacet: FacetGroupData = {
  label: "Sort by",
  facets: [
    {
      label: "Author (A-Z)",
      href: sortByAuthorHref,
      active: true
    },
    {
      label: "Title (A-Z)",
      href: sortByTitleHref,
      active: false
    }
  ]
};

const availabilityAllHref = feed("order=author&available=all");

const availabilityFacet: FacetGroupData = {
  label: "Availability",
  facets: [
    {
      label: "All",
      href: availabilityAllHref,
      active: true
    },
    {
      label: "Yours to keep",
      href: feed("order=author&available=always"),
      active: false
    },
    {
      label: "Available now",
      href: feed("order=author&available=now"),
      active: false
    }
  ]
};

const formatsBookHref = feed("order=author&entrypoint=Book");
const formatsAllHref = feed("order=author&entrypoint=All");

const formatsFacet: FacetGroupData = {
  label: "Formats",
  facets: [
    {
      label: "Ebooks",
      active: true,
      href: formatsBookHref
    },
    {
      label: "Audiobooks",
      href: feed("order=author&entrypoint=Audio"),
      active: false
    },
    {
      label: "All",
      href: formatsAllHref,
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
  expect(screen.getByText("Author (A-Z)")).toBeInTheDocument();
  expect(screen.getByText("Title (A-Z)")).toBeInTheDocument();

  expect(facet).toHaveValue(sortByAuthorHref);
});

test("renders availability select with correct options", () => {
  setup(<ListFilters collection={collectionWithFacets([availabilityFacet])} />);

  const facet = screen.getByLabelText("Availability");
  expect(screen.getByText("All")).toBeInTheDocument();
  expect(screen.getByText("Yours to keep")).toBeInTheDocument();
  expect(screen.getByText("Available now")).toBeInTheDocument();

  expect(facet).toHaveValue(availabilityAllHref);
});

test("does redirect when selected", async () => {
  const { user } = setup(
    <ListFilters collection={collectionWithFacets([sortByFacet])} />
  );

  const facet = screen.getByLabelText("Sort by");

  await user.selectOptions(facet, sortByTitleHref);

  expect(mockedRouter.push).toHaveBeenCalledTimes(1);
  expect(mockedRouter.push).toHaveBeenCalledWith(
    collectionLink(sortByTitleHref),
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

test("renders unrecognized groups with the labels the server sent", () => {
  const languageFacet: FacetGroupData = {
    label: "Language",
    facets: [
      {
        label: "English",
        href: feed("order=author&language=eng"),
        active: true
      },
      {
        label: "French",
        href: feed("order=author&language=fre"),
        active: false
      }
    ]
  };

  setup(<ListFilters collection={collectionWithFacets([languageFacet])} />);

  const facet = screen.getByLabelText("Language");
  expect(screen.getByText("English")).toBeInTheDocument();
  expect(screen.getByText("French")).toBeInTheDocument();
  // Still keyed on the href, so selection works without a known group key.
  expect(facet).toHaveValue(feed("order=author&language=eng"));
});

test("does not translate distributor names", () => {
  const distributorFacet: FacetGroupData = {
    label: "Distributor",
    facets: [
      {
        label: "All",
        href: feed("order=author&distributor=All"),
        active: true
      },
      {
        label: "Overdrive",
        href: feed("order=author&distributor=Overdrive"),
        active: false
      },
      {
        label: "Palace Marketplace",
        href: feed("order=author&distributor=Palace%20Marketplace"),
        active: false
      }
    ]
  };

  setup(<ListFilters collection={collectionWithFacets([distributorFacet])} />);

  expect(
    screen.getByRole("combobox", { name: "Distributor" })
  ).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "All" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Overdrive" })).toBeInTheDocument();
  expect(
    screen.getByRole("option", { name: "Palace Marketplace" })
  ).toBeInTheDocument();
});

test("groups sharing an option label select independently", async () => {
  const { user } = setup(
    <ListFilters
      collection={collectionWithFacets([availabilityFacet, formatsFacet])}
    />
  );

  // Both groups have an option reading "All".
  expect(screen.getAllByRole("option", { name: "All" })).toHaveLength(2);

  const formats = screen.getByRole("combobox", { name: "Formats" });
  await user.selectOptions(formats, formatsAllHref);

  expect(mockedRouter.push).toHaveBeenCalledTimes(1);
  expect(mockedRouter.push).toHaveBeenCalledWith(
    collectionLink(formatsAllHref),
    undefined,
    { shallow: true }
  );
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
    expect(screen.getByRole("option", { name: "Ebooks" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Audiobooks" })).toBeTruthy();
  });

  test("format filters navigate to respective urls", async () => {
    const { user } = setup(
      <PageTitle collection={collectionWithFormats}>Child</PageTitle>
    );

    const select = screen.getByRole("combobox", {
      name: "Formats"
    }) as HTMLSelectElement;
    // ebooks is selected
    expect(select.value).toBe(formatsBookHref);

    // click works
    await user.selectOptions(select, formatsAllHref);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      collectionLink(formatsAllHref),
      undefined,
      {
        shallow: true
      }
    );
  });
});

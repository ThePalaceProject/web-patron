import * as React from "react";
import { fixtures, screen, setup, fireEvent } from "test-utils";
import Search from "../Search";
import { mockPush } from "test-utils/mockNextRouter";
import useSWR from "swr";
import { makeSwrResponse, MockSwr } from "test-utils/mockSwr";
import { SearchData } from "interfaces";
import { mockUseTranslation } from "test-utils/mockUseTranslation";

const fixtureData = {
  template: "/search/{searchTerms}",
  description: "search desc",
  shortName: "search shortname",
  url: "http://search-url.com/"
};

const withLocale = (locale: string) =>
  mockUseTranslation().i18n.changeLanguage(locale);

afterEach(() => withLocale("en"));

jest.mock("swr");

const mockedSWR = useSWR as jest.MockedFunction<typeof useSWR>;

const mockSwr: MockSwr<SearchData> = (
  value = makeSwrResponse({ data: fixtureData })
) => {
  mockedSWR.mockImplementation((key: any) => {
    if (key?.[0] === "/collection")
      return makeSwrResponse<any>({ data: fixtures.emptyCollection });
    return makeSwrResponse<any>(value);
  });
};

test("doesn't render if there is no searchData set", () => {
  mockSwr({ data: undefined });
  const { container } = setup(<Search />, {
    router: {
      query: { collectionUrl: "/collection" }
    }
  });
  expect(container).toBeEmptyDOMElement();
});

test("fetches search description", async () => {
  mockSwr({ data: fixtureData });
  setup(<Search />, {
    router: {
      query: { collectionUrl: "/collection" }
    }
  });
  expect(mockedSWR).toHaveBeenCalledWith(
    ["/collection", "user-token"],
    expect.anything()
  );
  expect(mockedSWR).toHaveBeenCalledWith("/search-data-url", expect.anything());
});

test("searching calls history.push with url", async () => {
  mockSwr();
  const { user } = setup(<Search />, {
    router: {
      query: { collectionUrl: "/collection" }
    }
  });
  const searchButton = screen.getByText("Search");
  const input = screen.getByLabelText("Enter search keyword or keywords");
  // act
  await user.type(input, "my search");
  fireEvent.click(searchButton);

  // assert
  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith(
    "/testlib/collection/http%3A%2F%2Fsearch-url.com%2Fsearch%2Fmy%2520search",
    undefined,
    { shallow: true }
  );
});

test.each([
  ["search", "en", "Search"],
  ["search", "es", "Buscar"],
  ["search shortname", "es", "search shortname"],
  // i18next uses colons to identify the appropriate namespace.
  // We'll check to ensure any short names with colons are passed
  // through as the default value.
  ["search: shortname", "es", "search: shortname"],
  ["search:shortname", "es", "search:shortname"],
  ["common:search", "es", "common:search"]
])(
  "Search title attribute should resolve %s for locale %s to %s",
  (shortName, locale, expected) => {
    withLocale(locale);
    mockSwr({ data: { ...fixtureData, shortName } });
    setup(<Search />, {
      router: { locale, query: { collectionUrl: "/collection" } }
    });

    expect(screen.getByRole("searchbox")).toHaveAttribute("title", expected);
  }
);

import * as React from "react";
import { render, screen } from "test-utils";
import MultiLibraryHome from "../MultiLibraryHome";
import useSWR from "swr";
import { makeSwrResponse } from "test-utils/mockSwr";
import type { LibrariesResponse } from "pages/api/libraries";

jest.mock("swr");

const mockedSWR = useSWR as jest.MockedFunction<typeof useSWR>;

function mockLibraries(libraries: LibrariesResponse["libraries"]) {
  mockedSWR.mockReturnValue(makeSwrResponse<any>({ data: { libraries } }));
}

function lib(slug: string, title?: string) {
  return {
    id: `urn:${slug}`,
    slug,
    title: title ?? slug,
    authDocUrl: `https://example.com/${slug}/auth`
  };
}

describe("MultiLibraryHome", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("displays libraries sorted by title in ascending order", () => {
    mockLibraries([
      lib("zebra", "Zebra Library"),
      lib("alpha", "Alpha Library"),
      lib("middle", "Middle Library")
    ]);

    render(<MultiLibraryHome />);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("Alpha Library");
    expect(links[1]).toHaveTextContent("Middle Library");
    expect(links[2]).toHaveTextContent("Zebra Library");
  });

  it("displays libraries sorted by slug when no title is provided", () => {
    mockLibraries([lib("zebra"), lib("alpha"), lib("middle")]);

    render(<MultiLibraryHome />);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("alpha");
    expect(links[1]).toHaveTextContent("middle");
    expect(links[2]).toHaveTextContent("zebra");
  });

  it("displays libraries sorted by effective title (mix of custom titles and slugs)", () => {
    mockLibraries([
      lib("003"),
      lib("beta", "Charlie Library"),
      lib("alpha", "Bravo Library"),
      lib("001")
    ]);

    render(<MultiLibraryHome />);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("001");
    expect(links[1]).toHaveTextContent("003");
    expect(links[2]).toHaveTextContent("Bravo Library");
    expect(links[3]).toHaveTextContent("Charlie Library");
  });

  it("handles quoted numeric slugs with leading zeros correctly", () => {
    mockLibraries([lib("020"), lib("003"), lib("001"), lib("100")]);

    render(<MultiLibraryHome />);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("001");
    expect(links[1]).toHaveTextContent("003");
    expect(links[2]).toHaveTextContent("020");
    expect(links[3]).toHaveTextContent("100");
  });

  it("returns null when there are no libraries", () => {
    mockLibraries([]);

    const { container } = render(<MultiLibraryHome />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null while loading", () => {
    mockedSWR.mockReturnValue(makeSwrResponse<any>({ data: undefined }));

    const { container } = render(<MultiLibraryHome />);
    expect(container.firstChild).toBeNull();
  });

  it("displays an error message on fetch error", () => {
    mockedSWR.mockReturnValue(
      makeSwrResponse<any>({
        data: undefined,
        error: new Error("fetch failed")
      })
    );

    render(<MultiLibraryHome />);
    expect(
      screen.getByText(
        "Unable to load static libraries from configuration file."
      )
    ).toBeInTheDocument();
  });

  it("displays instance name in heading", () => {
    mockLibraries([lib("test", "Test Library")]);

    render(<MultiLibraryHome />, {
      appConfig: { instanceName: "My Custom Instance" }
    });

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "My Custom Instance Home"
    );
  });
});

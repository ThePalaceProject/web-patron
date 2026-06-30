import * as React from "react";
import { render, screen, fireEvent, act } from "test-utils";
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

  it("uses h2 for the sub-heading to maintain heading hierarchy", () => {
    mockLibraries([lib("test", "Test Library")]);
    render(<MultiLibraryHome />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Choose a library:"
    );
  });

  describe("library filter input", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    it("renders a filter input", () => {
      mockLibraries([lib("alpha", "Alpha Library")]);
      render(<MultiLibraryHome />);
      expect(
        screen.getByRole("searchbox", { name: /filter libraries/i })
      ).toBeInTheDocument();
    });

    it("filter input has aria-controls pointing to the results list", () => {
      mockLibraries([lib("alpha", "Alpha Library")]);
      render(<MultiLibraryHome />);
      const input = screen.getByRole("searchbox", {
        name: /filter libraries/i
      });
      const listId = input.getAttribute("aria-controls");
      expect(listId).toBeTruthy();
      expect(document.getElementById(listId!)).toBe(screen.getByRole("list"));
    });

    it("shows all libraries when filter is empty", () => {
      mockLibraries([
        lib("alpha", "Alpha Library"),
        lib("beta", "Beta Library")
      ]);
      render(<MultiLibraryHome />);
      expect(screen.getAllByRole("link")).toHaveLength(2);
    });

    it("narrows the list after the debounce delay", () => {
      mockLibraries([
        lib("alpha", "Alpha Library"),
        lib("beta", "Beta Library"),
        lib("gamma", "Gamma Library")
      ]);
      render(<MultiLibraryHome />);

      fireEvent.change(
        screen.getByRole("searchbox", { name: /filter libraries/i }),
        {
          target: { value: "alp" }
        }
      );

      // Before debounce fires the list should be unfiltered.
      expect(screen.getAllByRole("link")).toHaveLength(3);

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(screen.getAllByRole("link")).toHaveLength(1);
      expect(screen.getByRole("link")).toHaveTextContent("Alpha Library");
    });

    it("uses fuzzy matching (non-contiguous characters)", () => {
      mockLibraries([
        lib("alpha", "Alpha Library"),
        lib("beta", "Beta Library"),
        lib("gamma", "Gamma Library")
      ]);
      render(<MultiLibraryHome />);

      // "py" matches "al[p]ha librar[y]" but not Beta/Gamma (no 'p').
      fireEvent.change(
        screen.getByRole("searchbox", { name: /filter libraries/i }),
        {
          target: { value: "py" }
        }
      );

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(screen.getAllByRole("link")).toHaveLength(1);
      expect(screen.getByRole("link")).toHaveTextContent("Alpha Library");
    });

    it("shows no results when filter matches nothing", () => {
      mockLibraries([
        lib("alpha", "Alpha Library"),
        lib("beta", "Beta Library")
      ]);
      render(<MultiLibraryHome />);

      fireEvent.change(
        screen.getByRole("searchbox", { name: /filter libraries/i }),
        {
          target: { value: "zzz" }
        }
      );

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(screen.queryAllByRole("link")).toHaveLength(0);
      // Message appears in both the visible <p> and the visually-hidden live region.
      expect(screen.getAllByText("No libraries match.")).toHaveLength(2);
      expect(screen.getByRole("status")).toHaveTextContent(
        "No libraries match."
      );
    });

    it("restores the full list when filter is cleared", () => {
      mockLibraries([
        lib("alpha", "Alpha Library"),
        lib("beta", "Beta Library")
      ]);
      render(<MultiLibraryHome />);

      const input = screen.getByRole("searchbox", {
        name: /filter libraries/i
      });

      fireEvent.change(input, { target: { value: "alp" } });
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(screen.getAllByRole("link")).toHaveLength(1);

      fireEvent.change(input, { target: { value: "" } });
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(screen.getAllByRole("link")).toHaveLength(2);
    });

    it("announces result count in a live region after debounce", () => {
      mockLibraries([
        lib("alpha", "Alpha Library"),
        lib("beta", "Beta Library"),
        lib("gamma", "Gamma Library")
      ]);
      render(<MultiLibraryHome />);

      // No announcement when filter is empty.
      const status = screen.getByRole("status");
      expect(status).toHaveTextContent("");

      fireEvent.change(
        screen.getByRole("searchbox", { name: /filter libraries/i }),
        {
          target: { value: "alp" }
        }
      );

      // No announcement yet — debounce hasn't fired.
      expect(status).toHaveTextContent("");

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(status).toHaveTextContent("1 library shown");
    });

    it("announces plural form when multiple results remain", () => {
      mockLibraries([
        lib("alpha", "Alpha Library"),
        lib("albany", "Albany Library")
      ]);
      render(<MultiLibraryHome />);

      fireEvent.change(
        screen.getByRole("searchbox", { name: /filter libraries/i }),
        {
          target: { value: "al" }
        }
      );
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(screen.getByRole("status")).toHaveTextContent("2 libraries shown");
    });

    it("clears the status message when the filter is emptied", () => {
      mockLibraries([lib("alpha", "Alpha Library")]);
      render(<MultiLibraryHome />);

      const input = screen.getByRole("searchbox", {
        name: /filter libraries/i
      });

      fireEvent.change(input, { target: { value: "alp" } });
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(screen.getByRole("status")).toHaveTextContent("1 library shown");

      fireEvent.change(input, { target: { value: "" } });
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(screen.getByRole("status")).toHaveTextContent("");
    });

    it("highlights matched characters using <mark> elements", async () => {
      mockLibraries([lib("alpha", "Alpha Library")]);
      render(<MultiLibraryHome />);

      // No filter active — no <mark> elements.
      expect(screen.getByRole("link").querySelectorAll("mark")).toHaveLength(0);

      fireEvent.change(
        screen.getByRole("searchbox", { name: /filter libraries/i }),
        {
          target: { value: "alp" }
        }
      );

      await act(async () => {
        jest.advanceTimersByTime(200);
      });

      const link = screen.getByRole("link");
      expect(link.querySelectorAll("mark").length).toBeGreaterThan(0);
      expect(link.textContent).toBe("Alpha Library");
    });
  });
});

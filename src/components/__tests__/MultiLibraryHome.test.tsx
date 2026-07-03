import * as React from "react";
import { render, screen, fireEvent, act } from "test-utils";
import MultiLibraryHome, { scoreMatch } from "../MultiLibraryHome";
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

describe("scoreMatch", () => {
  it("returns score 0 and no indices for an empty query", () => {
    expect(scoreMatch("", "Illinois State Library")).toEqual({
      score: 0,
      matchIndices: []
    });
  });

  it("returns score 100 and full indices for an exact match", () => {
    expect(scoreMatch("illinois", "Illinois")).toEqual({
      score: 100,
      matchIndices: [0, 1, 2, 3, 4, 5, 6, 7]
    });
  });

  it("returns score 80 and leading indices when target starts with query", () => {
    expect(scoreMatch("ill", "Illinois State Library")).toEqual({
      score: 80,
      matchIndices: [0, 1, 2]
    });
  });

  it("returns score 60 and indices at the matching word when a word starts with query", () => {
    // "Illinois" starts at index 14 in "Northern Illinois University"
    //  N o r t h e r n   I  l  l  i  n  o  i  s
    //  0 1 2 3 4 5 6 7 8 9 10 11 ...
    const { score, matchIndices } = scoreMatch(
      "ill",
      "Northern Illinois University"
    );
    expect(score).toBe(60);
    expect(matchIndices).toEqual([9, 10, 11]);
  });

  it("anchors indices to the matching word, not an earlier fuzzy opportunity", () => {
    // "RAILS" contains 'i' and 'l' before "Illinois", but the word match wins.
    const { score, matchIndices } = scoreMatch(
      "ill",
      "RAILS eRead Illinois Library"
    );
    expect(score).toBe(60);
    // "Illinois" starts at index 12 in the lowercased string
    expect(matchIndices).toEqual([12, 13, 14]);
  });

  it("returns score 40 and substring indices when query appears as a substring", () => {
    // "ill" appears inside "Millbrook" at index 1
    expect(scoreMatch("ill", "Millbrook Library")).toEqual({
      score: 40,
      matchIndices: [1, 2, 3]
    });
  });

  it("returns score 20 and fuzzy indices for a non-contiguous match", () => {
    // "ill" in "Tidal Library": i→1, l→4, l→6 (T-i-d-a-l- -L-i...)
    const { score, matchIndices } = scoreMatch("ill", "Tidal Library");
    expect(score).toBe(20);
    expect(matchIndices).toEqual([1, 4, 6]);
  });

  it("returns score 0 and no indices when there is no match", () => {
    expect(scoreMatch("zzz", "Alpha Library")).toEqual({
      score: 0,
      matchIndices: []
    });
  });
});

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

    it("sorts alphabetically within the same relevance tier", () => {
      // Both start with "ill" (tier 80), so alpha order should apply within the tier.
      mockLibraries([
        lib("illinois-state", "Illinois State Library"),
        lib("illinois-central", "Illinois Central Library")
      ]);
      render(<MultiLibraryHome />);

      fireEvent.change(
        screen.getByRole("searchbox", { name: /filter libraries/i }),
        { target: { value: "ill" } }
      );
      act(() => {
        jest.advanceTimersByTime(200);
      });

      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveTextContent("Illinois Central Library");
      expect(links[1]).toHaveTextContent("Illinois State Library");
    });

    it("orders filtered results by relevance (highest first), overriding alpha order", () => {
      // Alphabetical order: East Illinois, Illinois State, Millbrook, Tidal
      // Relevance order for "ill": Illinois State (starts-with, 80), East Illinois
      //   (word-starts-with, 60), Millbrook (contains, 40), Tidal (fuzzy, 20)
      mockLibraries([
        lib("tidal", "Tidal Library"),
        lib("millbrook", "Millbrook Library"),
        lib("east-illinois", "East Illinois Library"),
        lib("illinois-state", "Illinois State Library")
      ]);
      render(<MultiLibraryHome />);

      fireEvent.change(
        screen.getByRole("searchbox", { name: /filter libraries/i }),
        { target: { value: "ill" } }
      );
      act(() => {
        jest.advanceTimersByTime(200);
      });

      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveTextContent("Illinois State Library");
      expect(links[1]).toHaveTextContent("East Illinois Library");
      expect(links[2]).toHaveTextContent("Millbrook Library");
      expect(links[3]).toHaveTextContent("Tidal Library");
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

      expect(status).toHaveTextContent("1 library shown, best matches first");
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

      expect(screen.getByRole("status")).toHaveTextContent(
        "2 libraries shown, best matches first"
      );
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
      expect(screen.getByRole("status")).toHaveTextContent(
        "1 library shown, best matches first"
      );

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

    it("highlights the best-match word, not the first fuzzy opportunity", async () => {
      // Searching "ill" in "RAILS eRead Illinois Library":
      // A greedy fuzzy scan would highlight 'il' from "RAILS" and 'l' from "Illinois".
      // bestMatchIndices should instead highlight 'ill' from "Illinois".
      mockLibraries([lib("rails-illinois", "RAILS eRead Illinois Library")]);
      render(<MultiLibraryHome />);

      fireEvent.change(
        screen.getByRole("searchbox", { name: /filter libraries/i }),
        { target: { value: "ill" } }
      );
      await act(async () => {
        jest.advanceTimersByTime(200);
      });

      const link = screen.getByRole("link");
      const marks = link.querySelectorAll("mark");
      // All highlighted characters should come from a single contiguous run in "Illinois".
      expect(
        Array.from(marks)
          .map(m => m.textContent)
          .join("")
      ).toBe("Ill");
    });
  });
});

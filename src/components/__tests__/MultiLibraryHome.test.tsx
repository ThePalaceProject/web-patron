import * as React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  setup,
  waitFor,
  within
} from "test-utils";
import {
  expectAnnouncement,
  myLibrariesSection,
  pinLibraries,
  seedCredentials
} from "test-utils/pinning";
import {
  PINNED_LIBRARIES_KEY,
  readPinnedLibraries
} from "utils/pinnedLibraries";
import { hasStoredCredentials } from "auth/useCredentials";
import { HIDE_PUBLIC_WARNING_KEY } from "utils/publicWarning";
import { copyToClipboard } from "utils/clipboard";
import MultiLibraryHome from "../MultiLibraryHome";
import useSWR from "swr";
import { makeSwrResponse } from "test-utils/mockSwr";
import type { ClientLibrary, LibrariesResponse } from "pages/api/libraries";

jest.mock("swr");
jest.mock("utils/clipboard", () => ({
  copyToClipboard: jest.fn().mockResolvedValue(true)
}));

const mockedCopy = copyToClipboard as jest.MockedFunction<
  typeof copyToClipboard
>;

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

/** Types into the library filter and waits out its debounce. */
function typeFilter(value: string) {
  fireEvent.change(
    screen.getByRole("searchbox", { name: /Filter libraries/ }),
    { target: { value } }
  );
  act(() => {
    jest.advanceTimersByTime(200);
  });
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

  it("passes each library's logo and description to its card", () => {
    mockLibraries([
      {
        ...lib("alpha", "Alpha Library"),
        logoUrl: "https://example.com/alpha/logo.png",
        description: "Serving Alphaville."
      }
    ]);
    render(<MultiLibraryHome />);

    expect(screen.getByRole("presentation")).toHaveAttribute(
      "src",
      "https://example.com/alpha/logo.png"
    );
    expect(
      screen.getByRole("link", { name: "Alpha Library" })
    ).toHaveAccessibleDescription("Serving Alphaville.");
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

  it("shows a message when there are no libraries", () => {
    mockLibraries([]);

    render(<MultiLibraryHome />);
    expect(screen.getByText("No libraries available.")).toBeInTheDocument();
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

  describe("pinning", () => {
    const alpha = lib("alpha", "Alpha Library");
    const beta = lib("beta", "Beta Library");

    beforeEach(() => {
      localStorage.setItem(HIDE_PUBLIC_WARNING_KEY, "true");
      mockLibraries([alpha, beta]);
    });

    it("pinning a library adds it to My Libraries above the list", async () => {
      const { user } = setup(<MultiLibraryHome />);
      expect(
        screen.queryByRole("heading", { name: "My Libraries" })
      ).toBeNull();

      await user.click(
        screen.getByRole("button", { name: "Pin Beta Library to My Libraries" })
      );

      const section = myLibrariesSection();
      expect(
        within(section).getByRole("link", { name: "Beta Library" })
      ).toBeInTheDocument();
      expect(
        within(section).getByRole("button", {
          name: "Unpin Beta Library from My Libraries"
        })
      ).toBeInTheDocument();
      // The pressed button was in the list that is now hidden, so focus
      // moves to the library's new button in My Libraries.
      expect(
        within(section).getByRole("button", {
          name: "Unpin Beta Library from My Libraries"
        })
      ).toHaveFocus();
    });

    it("pinning through the warning dialog moves focus to the pinned library", async () => {
      localStorage.removeItem(HIDE_PUBLIC_WARNING_KEY);
      const { user } = setup(<MultiLibraryHome />);

      act(() =>
        screen
          .getByRole("button", { name: "Pin Beta Library to My Libraries" })
          .focus()
      );
      await user.keyboard("{Enter}");
      await screen.findByRole("alertdialog");
      act(() => screen.getByRole("button", { name: "Pin Library" }).focus());
      await user.keyboard("{Enter}");

      await waitFor(() =>
        expect(
          within(myLibrariesSection()).getByRole("button", {
            name: "Unpin Beta Library from My Libraries"
          })
        ).toHaveFocus()
      );
    });

    it("signed-in unpin through its dialog moves focus to the next pinned library", async () => {
      pinLibraries(alpha, beta);
      seedCredentials("alpha");
      const { user } = setup(<MultiLibraryHome />);

      act(() =>
        screen
          .getByRole("button", {
            name: "Unpin Alpha Library from My Libraries"
          })
          .focus()
      );
      await user.keyboard("{Enter}");
      await screen.findByRole("alertdialog", { name: "Unpin Library" });
      act(() =>
        screen.getByRole("button", { name: "Unpin and Sign Out" }).focus()
      );
      await user.keyboard("{Enter}");

      const unpinBeta = within(myLibrariesSection()).getByRole("button", {
        name: "Unpin Beta Library from My Libraries"
      });
      await waitFor(() => expect(unpinBeta).toHaveFocus());
      expect(hasStoredCredentials("alpha")).toBe(false);
    });

    it("pinning from search results clears the search and hides the list", async () => {
      pinLibraries(beta);
      const { user } = setup(<MultiLibraryHome />);
      typeFilter("alp");
      await user.click(
        screen.getByRole("button", {
          name: "Pin Alpha Library to My Libraries"
        })
      );

      expect(
        screen.getByRole("searchbox", { name: /Filter libraries/ })
      ).toHaveValue("");
      expect(
        screen.getAllByRole("link").map(link => link.getAttribute("href"))
      ).toEqual(["/beta", "/alpha"]);
      expect(
        within(myLibrariesSection()).getByRole("button", {
          name: "Unpin Alpha Library from My Libraries"
        })
      ).toHaveFocus();
    });

    it("a pin from another tab keeps the typed search and its focus", () => {
      pinLibraries(beta);
      render(<MultiLibraryHome />);
      const searchbox = screen.getByRole("searchbox", {
        name: /Filter libraries/
      });
      act(() => searchbox.focus());
      typeFilter("alp");

      pinLibraries(beta, alpha);
      act(() => {
        window.dispatchEvent(
          new StorageEvent("storage", { key: PINNED_LIBRARIES_KEY })
        );
      });

      expect(myLibrariesSection()).toHaveTextContent("Alpha Library");
      expect(searchbox).toHaveValue("alp");
      expect(searchbox).toHaveFocus();
    });

    it("unpinning from My Libraries clears the search", async () => {
      pinLibraries(alpha, beta);
      const { user } = setup(<MultiLibraryHome />);
      typeFilter("alp");

      await user.click(
        within(myLibrariesSection()).getByRole("button", {
          name: "Unpin Beta Library from My Libraries"
        })
      );

      expect(
        screen.getByRole("searchbox", { name: /Filter libraries/ })
      ).toHaveValue("");
      // Beta was last in the list, so focus moves to the previous library.
      expect(
        within(myLibrariesSection()).getByRole("button", {
          name: "Unpin Alpha Library from My Libraries"
        })
      ).toHaveFocus();
    });

    it("clearing the search hides the list again", () => {
      pinLibraries(beta);
      render(<MultiLibraryHome />);
      typeFilter("alp");
      expect(screen.getAllByRole("link")).toHaveLength(2);

      typeFilter("");
      expect(screen.getAllByRole("link")).toHaveLength(1);
    });

    it.each([
      [false, "Choose a library: Filter libraries"],
      [true, "Find another library: Filter libraries"]
    ])("names the search box from its heading (pinned: %p)", (pinned, name) => {
      if (pinned) pinLibraries(beta);
      render(<MultiLibraryHome />);
      expect(screen.getByRole("searchbox", { name })).toBeInTheDocument();
    });

    it("with a pin, hides the library list until a filter is typed", () => {
      pinLibraries(beta);
      render(<MultiLibraryHome />);

      expect(
        screen.getByRole("heading", { name: "Find another library:" })
      ).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Alpha Library" })).toBeNull();

      const searchbox = screen.getByRole("searchbox", {
        name: /Filter libraries/
      });
      expect(searchbox).not.toHaveAttribute("aria-controls");
      expect(searchbox).toHaveAccessibleDescription(
        "Matching libraries appear as you type."
      );
      typeFilter("alp");
      expect(
        screen.getAllByRole("link").map(link => link.getAttribute("href"))
      ).toContain("/alpha");
      expect(searchbox).toHaveAttribute(
        "aria-controls",
        "library-filter-results"
      );
    });

    it("unpinning the last library moves focus to the search input and announces it", async () => {
      pinLibraries(alpha);
      mockLibraries([alpha]);
      const { user } = setup(<MultiLibraryHome />);

      const section = myLibrariesSection();
      await user.click(
        within(section).getByRole("button", {
          name: "Unpin Alpha Library from My Libraries"
        })
      );

      expect(
        screen.queryByRole("heading", { name: "My Libraries" })
      ).toBeNull();
      // Landing mid-list on the library's other pin button is disorienting,
      // so the search input is the predictable target.
      expect(
        screen.getByRole("searchbox", { name: /Filter libraries/ })
      ).toHaveFocus();
      await screen.findByText(
        "Alpha Library unpinned from My Libraries. No libraries are pinned."
      );
    });

    it("shows no pin controls when pinning is disabled", () => {
      render(<MultiLibraryHome />, { appConfig: { enablePinning: false } });
      expect(screen.queryByRole("button", { name: /My Libraries/ })).toBeNull();
    });
  });

  describe("reordering My Libraries", () => {
    const alpha = lib("alpha", "Alpha Library");
    const beta = lib("beta", "Beta Library");

    beforeEach(() => {
      mockLibraries([alpha, beta]);
    });

    const pinnedOrder = () => readPinnedLibraries().map(entry => entry.slug);

    const startReordering = async (...pins: ClientLibrary[]) => {
      pinLibraries(...pins);
      const utils = setup(<MultiLibraryHome />);
      await utils.user.click(
        screen.getByRole("button", { name: "Reorder My Libraries" })
      );
      return utils;
    };

    it("offers Reorder only when two or more pinned libraries are shown", () => {
      pinLibraries(alpha);
      render(<MultiLibraryHome />);
      expect(
        screen.queryByRole("button", { name: "Reorder My Libraries" })
      ).toBeNull();
    });

    it("shows move buttons in place of pin buttons and links while reordering", async () => {
      const { user } = await startReordering(alpha, beta);

      const section = myLibrariesSection();
      expect(
        within(section).getByRole("button", { name: "Move Alpha Library up" })
      ).toHaveAttribute("aria-disabled", "true");
      expect(
        within(section).queryByRole("button", { name: /from My Libraries/ })
      ).toBeNull();
      // The cards cannot be opened while reordering.
      expect(within(section).queryByRole("link")).toBeNull();
      expect(within(section).getByText("Alpha Library")).toBeInTheDocument();
      // The drag handle is not a tab stop.
      await user.tab();
      expect(
        within(section).getByRole("button", { name: "Move Alpha Library up" })
      ).toHaveFocus();

      await user.click(
        screen.getByRole("button", { name: "Done reordering My Libraries" })
      );
      expect(
        within(section).queryByRole("button", { name: /^Move / })
      ).toBeNull();
      expect(
        within(section).getByRole("button", {
          name: "Unpin Alpha Library from My Libraries"
        })
      ).toBeInTheDocument();
      expect(
        within(section).getByRole("link", { name: "Alpha Library" })
      ).toBeInTheDocument();
    });

    it.each([
      ["Move Alpha Library down", "Alpha Library moved to position 2 of 2."],
      ["Move Beta Library up", "Beta Library moved to position 1 of 2."]
    ])(
      "%s moves it, keeps focus on the button, and announces it",
      async (buttonName, announcement) => {
        const { user } = await startReordering(alpha, beta);

        await user.click(screen.getByRole("button", { name: buttonName }));

        expect(pinnedOrder()).toEqual(["beta", "alpha"]);
        const button = screen.getByRole("button", { name: buttonName });
        expect(button).toHaveFocus();
        // The library is now at the end the button points to.
        expect(button).toHaveAttribute("aria-disabled", "true");
        expectAnnouncement(announcement);
      }
    );

    it("focuses the Move button after the move renders", async () => {
      await startReordering(alpha, beta);
      // A plain click event does not move focus, so only the list's refocus
      // after the move can put focus on the button. Real browsers can drop
      // focus from a moved list item.
      fireEvent.click(
        screen.getByRole("button", { name: "Move Alpha Library down" })
      );

      expect(pinnedOrder()).toEqual(["beta", "alpha"]);
      expect(
        screen.getByRole("button", { name: "Move Alpha Library down" })
      ).toHaveFocus();
    });

    it("moves past a pinned library that the server list no longer has", async () => {
      const { user } = await startReordering(
        alpha,
        lib("gone", "Gone Library"),
        beta
      );

      await user.click(
        screen.getByRole("button", { name: "Move Alpha Library down" })
      );

      expect(pinnedOrder()).toEqual(["gone", "beta", "alpha"]);
      expectAnnouncement("Alpha Library moved to position 2 of 2.");
    });

    it("leaves reorder mode when fewer than two libraries are shown", async () => {
      await startReordering(alpha, beta);

      // Another tab unpins one library, then pins it again.
      const syncFromStorage = () =>
        act(() => {
          window.dispatchEvent(
            new StorageEvent("storage", { key: PINNED_LIBRARIES_KEY })
          );
        });
      pinLibraries(alpha);
      syncFromStorage();
      expect(
        screen.getByRole("searchbox", { name: /Filter libraries/ })
      ).toBeInTheDocument();
      pinLibraries(alpha, beta);
      syncFromStorage();

      expect(
        screen.getByRole("button", { name: "Reorder My Libraries" })
      ).toBeInTheDocument();
      expect(
        within(myLibrariesSection()).getByRole("link", {
          name: "Alpha Library"
        })
      ).toBeInTheDocument();
    });

    it("hides Find another library while reordering", async () => {
      const { user } = await startReordering(alpha, beta);

      expect(
        screen.queryByRole("heading", { name: "Find another library:" })
      ).toBeNull();
      expect(screen.queryByRole("searchbox")).toBeNull();

      await user.click(
        screen.getByRole("button", { name: "Done reordering My Libraries" })
      );
      expect(
        screen.getByRole("heading", { name: "Find another library:" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("searchbox", { name: /Filter libraries/ })
      ).toBeInTheDocument();
    });

    it.each(["Move Alpha Library up", "Move Beta Library down"])(
      "ignores %s at the edge of the list",
      async buttonName => {
        const { user } = await startReordering(alpha, beta);

        await user.click(screen.getByRole("button", { name: buttonName }));

        expect(pinnedOrder()).toEqual(["alpha", "beta"]);
      }
    );
  });

  describe("pins link", () => {
    it("adds pins from a ?pins link after confirmation", async () => {
      mockLibraries([
        {
          ...lib("alpha", "Alpha Library"),
          logoUrl: "https://s3.example.com/alpha.png"
        },
        lib("beta", "Beta Library")
      ]);
      const replace = jest.fn();

      render(<MultiLibraryHome />, {
        router: { query: { pins: "beta,alpha" }, replace }
      });

      const dialog = await screen.findByRole("alertdialog", {
        name: "Add to My Libraries"
      });
      expect(within(dialog).getByText("Beta Library")).toBeInTheDocument();
      expect(within(dialog).getByText("Alpha Library")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Add libraries" }));

      // Pins stored in link order, carrying the server logo.
      const stored = readPinnedLibraries();
      expect(stored.map(entry => entry.id)).toEqual(["urn:beta", "urn:alpha"]);
      expect(stored[1].logoUrl).toBe("https://s3.example.com/alpha.png");

      // The parameter is stripped from the URL.
      expect(replace).toHaveBeenCalled();
      expect(replace.mock.calls[0][0].query.pins).toBeUndefined();

      await waitFor(() =>
        expect(
          screen.queryByRole("alertdialog", { name: "Add to My Libraries" })
        ).toBeNull()
      );
    });

    it("focuses My Libraries and announces the count after adding", async () => {
      mockLibraries([
        lib("alpha", "Alpha Library"),
        lib("beta", "Beta Library")
      ]);

      render(<MultiLibraryHome />, {
        router: { query: { pins: "alpha,beta" }, replace: jest.fn() }
      });

      await screen.findByRole("alertdialog", {
        name: "Add to My Libraries"
      });
      fireEvent.click(screen.getByRole("button", { name: "Add libraries" }));

      await waitFor(() =>
        expect(
          screen.getByRole("heading", { name: "My Libraries" })
        ).toHaveFocus()
      );
      expectAnnouncement("2 libraries added to My Libraries.");
    });

    it("ignores a ?pins link when pinning is disabled", () => {
      mockLibraries([lib("alpha", "Alpha Library")]);
      const replace = jest.fn();

      render(<MultiLibraryHome />, {
        appConfig: { enablePinning: false },
        router: { query: { pins: "alpha" }, replace }
      });

      expect(
        screen.queryByRole("alertdialog", { name: "Add to My Libraries" })
      ).toBeNull();
      expect(replace).not.toHaveBeenCalled();
      expect(readPinnedLibraries()).toEqual([]);
    });

    it("stores nothing when the link dialog is canceled", async () => {
      mockLibraries([lib("alpha", "Alpha Library")]);
      const replace = jest.fn();

      render(<MultiLibraryHome />, {
        router: { query: { pins: "alpha" }, replace }
      });

      await screen.findByRole("alertdialog", { name: "Add to My Libraries" });
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(readPinnedLibraries()).toEqual([]);
      expect(replace).toHaveBeenCalled();
      await waitFor(() =>
        expect(
          screen.queryByRole("alertdialog", { name: "Add to My Libraries" })
        ).toBeNull()
      );
    });

    it("strips the param without a dialog when there is nothing new to add", () => {
      pinLibraries(lib("alpha", "Alpha Library"));
      mockLibraries([lib("alpha", "Alpha Library")]);
      const replace = jest.fn();

      render(<MultiLibraryHome />, {
        router: { query: { pins: "alpha,ghost" }, replace }
      });

      expect(
        screen.queryByRole("alertdialog", { name: "Add to My Libraries" })
      ).toBeNull();
      expect(replace).toHaveBeenCalled();
    });

    it("adds pins named by id, preferring an id match over a slug match", async () => {
      // "clash" is one library's id and another library's slug.
      const byId = { id: "clash", slug: "first", title: "First Library" };
      const bySlug = {
        id: "urn:second",
        slug: "clash",
        title: "Second Library"
      };
      mockLibraries([
        { ...byId, authDocUrl: "https://example.com/first/auth" },
        { ...bySlug, authDocUrl: "https://example.com/second/auth" }
      ]);
      const replace = jest.fn();

      render(<MultiLibraryHome />, {
        // "clash" resolves by id. "first" names the same library by slug,
        // so it resolves once. "urn:second" resolves by id.
        router: { query: { pins: "clash,first,urn:second" }, replace }
      });

      const dialog = await screen.findByRole("alertdialog", {
        name: "Add to My Libraries"
      });
      expect(within(dialog).getByText("First Library")).toBeInTheDocument();
      expect(within(dialog).getByText("Second Library")).toBeInTheDocument();
      expect(within(dialog).getAllByRole("listitem")).toHaveLength(2);

      fireEvent.click(screen.getByRole("button", { name: "Add libraries" }));
      expect(readPinnedLibraries().map(entry => entry.id)).toEqual([
        "clash",
        "urn:second"
      ]);
    });

    it("appends missing libraries after existing pins without touching them", async () => {
      pinLibraries(lib("alpha", "Alpha Library"));
      mockLibraries([
        lib("alpha", "Alpha Library"),
        lib("beta", "Beta Library"),
        lib("gamma", "Gamma Library")
      ]);
      const replace = jest.fn();

      render(<MultiLibraryHome />, {
        // Alpha is already pinned; the link lists it anyway.
        router: { query: { pins: "urn:gamma,alpha,urn:beta" }, replace }
      });

      const dialog = await screen.findByRole("alertdialog", {
        name: "Add to My Libraries"
      });
      // Only the missing libraries are offered.
      expect(within(dialog).queryByText("Alpha Library")).toBeNull();

      fireEvent.click(screen.getByRole("button", { name: "Add libraries" }));

      // Existing pins stay first and untouched; the rest append in link order.
      expect(readPinnedLibraries().map(entry => entry.id)).toEqual([
        "urn:alpha",
        "urn:gamma",
        "urn:beta"
      ]);
    });

    it("clears the param when the dialog is dismissed with Escape", async () => {
      mockLibraries([lib("alpha", "Alpha Library")]);
      const replace = jest.fn();

      render(<MultiLibraryHome />, {
        router: { query: { pins: "alpha" }, replace }
      });

      await screen.findByRole("alertdialog", { name: "Add to My Libraries" });
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape"
      });

      await waitFor(() =>
        expect(
          screen.queryByRole("alertdialog", { name: "Add to My Libraries" })
        ).toBeNull()
      );
      expect(readPinnedLibraries()).toEqual([]);
      expect(replace).toHaveBeenCalled();
      expect(replace.mock.calls[0][0].query.pins).toBeUndefined();
    });

    it("hides the Share button while reordering", () => {
      pinLibraries(lib("alpha", "Alpha Library"), lib("beta", "Beta Library"));
      mockLibraries([
        lib("alpha", "Alpha Library"),
        lib("beta", "Beta Library")
      ]);
      render(<MultiLibraryHome />);

      expect(
        screen.getByRole("button", { name: "Share My Libraries" })
      ).toBeInTheDocument();

      fireEvent.click(
        screen.getByRole("button", { name: "Reorder My Libraries" })
      );

      expect(
        screen.queryByRole("button", {
          name: "Share My Libraries"
        })
      ).toBeNull();
    });

    it("copies a link carrying the pinned entries in order", async () => {
      pinLibraries(lib("beta", "Beta Library"), lib("alpha", "Alpha Library"));
      mockLibraries([
        lib("alpha", "Alpha Library"),
        lib("beta", "Beta Library")
      ]);

      render(<MultiLibraryHome />);
      fireEvent.click(
        screen.getByRole("button", { name: "Share My Libraries" })
      );

      await waitFor(() => expect(mockedCopy).toHaveBeenCalled());
      const url = new URL(mockedCopy.mock.calls[0][0]);
      expect(url.pathname).toBe("/");
      expect(url.searchParams.get("pins")).toBe("urn:beta,urn:alpha");

      expect(await screen.findByText("Link copied.")).toBeInTheDocument();
      expectAnnouncement("Link copied.");
    });

    it("copies only the pinned libraries shown on the page", async () => {
      // "ghost" stays pinned in storage, but the server list no longer has
      // it under that id, so the page does not show it.
      pinLibraries(
        lib("alpha", "Alpha Library"),
        lib("ghost", "Ghost Library"),
        lib("beta", "Beta Library")
      );
      mockLibraries([
        lib("alpha", "Alpha Library"),
        lib("beta", "Beta Library")
      ]);

      render(<MultiLibraryHome />);
      fireEvent.click(
        screen.getByRole("button", { name: "Share My Libraries" })
      );

      await waitFor(() => expect(mockedCopy).toHaveBeenCalled());
      const url = new URL(mockedCopy.mock.calls[0][0]);
      expect(url.searchParams.get("pins")).toBe("urn:alpha,urn:beta");
    });

    it("shows and announces a failed copy", async () => {
      mockedCopy.mockResolvedValueOnce(false);
      pinLibraries(lib("alpha", "Alpha Library"));
      mockLibraries([lib("alpha", "Alpha Library")]);

      render(<MultiLibraryHome />);
      fireEvent.click(
        screen.getByRole("button", { name: "Share My Libraries" })
      );

      expect(
        await screen.findByText("Could not copy link.")
      ).toBeInTheDocument();
      expectAnnouncement("Could not copy link.");
    });
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
      const { container } = render(<MultiLibraryHome />);

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
      expect(within(container).getByRole("status")).toHaveTextContent(
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
      const { container } = render(<MultiLibraryHome />);

      // No announcement when filter is empty.
      const status = within(container).getByRole("status");
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
      const { container } = render(<MultiLibraryHome />);

      fireEvent.change(
        screen.getByRole("searchbox", { name: /filter libraries/i }),
        {
          target: { value: "al" }
        }
      );
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(within(container).getByRole("status")).toHaveTextContent(
        "2 libraries shown, best matches first"
      );
    });

    it("clears the status message when the filter is emptied", () => {
      mockLibraries([lib("alpha", "Alpha Library")]);
      const { container } = render(<MultiLibraryHome />);

      const input = screen.getByRole("searchbox", {
        name: /filter libraries/i
      });

      fireEvent.change(input, { target: { value: "alp" } });
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(within(container).getByRole("status")).toHaveTextContent(
        "1 library shown, best matches first"
      );

      fireEvent.change(input, { target: { value: "" } });
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(within(container).getByRole("status")).toHaveTextContent("");
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

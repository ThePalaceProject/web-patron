import * as React from "react";
import { act, render, screen, fireEvent, setup, waitFor } from "test-utils";
import useSWR from "swr";
import fetchMock from "jest-fetch-mock";
import WorkLibrarySelector, {
  RESOLVE_TIMEOUT_MS
} from "../WorkLibrarySelector";
import { makeSwrResponse } from "test-utils/mockSwr";
import { mockPush } from "test-utils/mockNextRouter";
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

// jsdom has no scrollIntoView implementation.
Element.prototype.scrollIntoView = jest.fn();

/*
 * Mocks a fetch that never settles until its abort signal fires, then rejects
 * the way a real aborted fetch does. jest-fetch-mock does not react to the
 * signal option on its own.
 */
function mockPendingFetchOnce() {
  fetchMock.mockImplementationOnce(
    (input?: string | Request, init?: RequestInit) =>
      new Promise<Response>((resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("The operation was aborted.", "AbortError"))
        );
      })
  );
}

describe("WorkLibrarySelector", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns null while loading", () => {
    mockedSWR.mockReturnValue(makeSwrResponse<any>({ data: undefined }));
    const { container } = render(<WorkLibrarySelector workId="work-1" />);
    expect(container.firstChild).toBeNull();
  });

  it("displays an error message on fetch error", () => {
    mockedSWR.mockReturnValue(
      makeSwrResponse<any>({
        data: undefined,
        error: new Error("fetch failed")
      })
    );
    render(<WorkLibrarySelector workId="work-1" />);
    expect(
      screen.getByText("Unable to load the library list.")
    ).toBeInTheDocument();
  });

  it("shows a message when no libraries are returned", () => {
    mockLibraries([]);
    render(<WorkLibrarySelector workId="work-1" />);
    expect(screen.getByText("No libraries available.")).toBeInTheDocument();
  });

  it("renders a heading and a card for each library", () => {
    mockLibraries([lib("alpha", "Alpha Library"), lib("beta", "Beta Library")]);
    render(<WorkLibrarySelector workId="work-1" />);

    expect(
      screen.getByRole("heading", {
        name: "Choose your library to view this item:"
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Alpha Library" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Beta Library" })
    ).toBeInTheDocument();
  });

  it("sorts libraries by title", () => {
    mockLibraries([
      lib("zebra", "Zebra Library"),
      lib("alpha", "Alpha Library")
    ]);
    render(<WorkLibrarySelector workId="work-1" />);

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveTextContent("Alpha Library");
    expect(buttons[1]).toHaveTextContent("Zebra Library");
  });

  it("navigates to the book page when the item is available", async () => {
    mockLibraries([lib("alpha", "Alpha Library")]);
    fetchMock.mockResponses(
      [
        JSON.stringify({ catalogUrl: "https://alpha.example.com/catalog" }),
        { status: 200 }
      ],
      ["", { status: 200 }]
    );
    const { user } = setup(<WorkLibrarySelector workId="work-1" />);

    await user.click(screen.getByRole("button", { name: "Alpha Library" }));

    const expectedBookUrl = "https://alpha.example.com/catalog/works/work-1";
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(
        `/alpha/book/${encodeURIComponent(expectedBookUrl)}`
      )
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/catalog-url?slug=alpha",
      {
        signal: expect.any(AbortSignal)
      }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2, expectedBookUrl, {
      signal: expect.any(AbortSignal)
    });
  });

  it("shows an 'Opening…' loading state while resolving", async () => {
    mockLibraries([lib("alpha", "Alpha Library")]);
    fetchMock.mockResponses(
      [
        JSON.stringify({ catalogUrl: "https://alpha.example.com/catalog" }),
        { status: 200 }
      ],
      ["", { status: 200 }]
    );
    render(<WorkLibrarySelector workId="work-1" />);

    const button = screen.getByRole("button", { name: "Alpha Library" });
    fireEvent.click(button);

    expect(screen.getByText("Opening… (Esc to cancel)")).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");

    await waitFor(() => expect(mockPush).toHaveBeenCalled());
  });

  it("cancels the resolve without an error when the user presses Escape", async () => {
    mockLibraries([lib("alpha", "Alpha Library")]);
    mockPendingFetchOnce();
    render(<WorkLibrarySelector workId="work-1" />);

    const button = screen.getByRole("button", { name: "Alpha Library" });
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-disabled", "true");

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() =>
      expect(button).toHaveAttribute("aria-disabled", "false")
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  // Fake timers are enabled globally (jest.config.js), so the resolve
  // timeout can be advanced directly without installing or restoring timers.
  it("aborts the resolve and shows an error when it times out", async () => {
    mockLibraries([lib("alpha", "Alpha Library")]);
    mockPendingFetchOnce();
    render(<WorkLibrarySelector workId="work-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Alpha Library" }));
    act(() => {
      jest.advanceTimersByTime(RESOLVE_TIMEOUT_MS);
    });

    expect(
      await screen.findByText("Unable to reach this library.")
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("ignores additional activations while resolving", async () => {
    mockLibraries([lib("alpha", "Alpha Library")]);
    fetchMock.mockResponses(
      [
        JSON.stringify({ catalogUrl: "https://alpha.example.com/catalog" }),
        { status: 200 }
      ],
      ["", { status: 200 }]
    );
    render(<WorkLibrarySelector workId="work-1" />);

    const button = screen.getByRole("button", { name: "Alpha Library" });
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("blocks selection on every card while one is resolving", async () => {
    mockLibraries([lib("alpha", "Alpha Library"), lib("beta", "Beta Library")]);
    fetchMock.mockResponses(
      [
        JSON.stringify({ catalogUrl: "https://alpha.example.com/catalog" }),
        { status: 200 }
      ],
      ["", { status: 200 }]
    );
    render(<WorkLibrarySelector workId="work-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Alpha Library" }));
    const betaButton = screen.getByRole("button", { name: "Beta Library" });
    expect(betaButton).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(betaButton);

    await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1));
    expect(mockPush).toHaveBeenCalledWith(
      `/alpha/book/${encodeURIComponent(
        "https://alpha.example.com/catalog/works/work-1"
      )}`
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).not.toHaveBeenCalledWith("/api/catalog-url?slug=beta");
  });

  it("shows an unavailable-library error when catalog-url lookup 404s", async () => {
    mockLibraries([lib("alpha", "Alpha Library")]);
    fetchMock.mockResponseOnce("", { status: 404 });
    const { user } = setup(<WorkLibrarySelector workId="work-1" />);

    await user.click(screen.getByRole("button", { name: "Alpha Library" }));

    expect(
      await screen.findByText("This library is unavailable.")
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows the error panel when the catalog-url request fails", async () => {
    mockLibraries([lib("alpha", "Alpha Library")]);
    fetchMock.mockRejectOnce(new Error("network down"));
    const { user } = setup(<WorkLibrarySelector workId="work-1" />);

    await user.click(screen.getByRole("button", { name: "Alpha Library" }));

    expect(
      await screen.findByText("Unable to reach this library.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Back to search" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows a generic error when the catalog-url request returns a non-404 error status", async () => {
    mockLibraries([lib("alpha", "Alpha Library")]);
    fetchMock.mockResponseOnce("", { status: 500 });
    const { user } = setup(<WorkLibrarySelector workId="work-1" />);

    await user.click(screen.getByRole("button", { name: "Alpha Library" }));

    expect(
      await screen.findByText("Unable to reach this library.")
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("percent-encodes the workId when building the book URL", async () => {
    mockLibraries([lib("alpha", "Alpha Library")]);
    fetchMock.mockResponses(
      [
        JSON.stringify({ catalogUrl: "https://alpha.example.com/catalog" }),
        { status: 200 }
      ],
      ["", { status: 200 }]
    );
    const { user } = setup(<WorkLibrarySelector workId="urn:uuid:1/2" />);

    await user.click(screen.getByRole("button", { name: "Alpha Library" }));

    const expectedBookUrl =
      "https://alpha.example.com/catalog/works/urn%3Auuid%3A1%2F2";
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(
        `/alpha/book/${encodeURIComponent(expectedBookUrl)}`
      )
    );
    expect(fetchMock).toHaveBeenNthCalledWith(2, expectedBookUrl, {
      signal: expect.any(AbortSignal)
    });
  });

  it("shows a generic error when the pre-flight check returns a 5xx status", async () => {
    mockLibraries([lib("alpha", "Alpha Library")]);
    fetchMock.mockResponses(
      [
        JSON.stringify({ catalogUrl: "https://alpha.example.com/catalog" }),
        { status: 200 }
      ],
      ["", { status: 500 }]
    );
    const { user } = setup(<WorkLibrarySelector workId="work-1" />);

    await user.click(screen.getByRole("button", { name: "Alpha Library" }));

    expect(
      await screen.findByText("Unable to reach this library.")
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("navigates when the pre-flight check returns an auth-gated status", async () => {
    mockLibraries([lib("alpha", "Alpha Library")]);
    fetchMock.mockResponses(
      [
        JSON.stringify({ catalogUrl: "https://alpha.example.com/catalog" }),
        { status: 200 }
      ],
      ["", { status: 401 }]
    );
    const { user } = setup(<WorkLibrarySelector workId="work-1" />);

    await user.click(screen.getByRole("button", { name: "Alpha Library" }));

    const expectedBookUrl = "https://alpha.example.com/catalog/works/work-1";
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(
        `/alpha/book/${encodeURIComponent(expectedBookUrl)}`
      )
    );
  });

  it("shows an error and makes the card selectable again when navigation fails", async () => {
    mockLibraries([lib("alpha", "Alpha Library")]);
    fetchMock.mockResponses(
      [
        JSON.stringify({ catalogUrl: "https://alpha.example.com/catalog" }),
        { status: 200 }
      ],
      ["", { status: 200 }]
    );
    mockPush.mockRejectedValueOnce(new Error("route load failed"));
    const { user } = setup(<WorkLibrarySelector workId="work-1" />);

    await user.click(screen.getByRole("button", { name: "Alpha Library" }));

    expect(
      await screen.findByText("Unable to open this item.")
    ).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Alpha Library" });
    expect(button).toHaveAttribute("aria-disabled", "false");
    expect(button).toHaveFocus();
  });

  it("shows an item-unavailable panel when the pre-flight check fails", async () => {
    mockLibraries([lib("alpha", "Alpha Library")]);
    fetchMock.mockResponses(
      [
        JSON.stringify({ catalogUrl: "https://alpha.example.com/catalog" }),
        { status: 200 }
      ],
      ["", { status: 404 }]
    );
    const { user } = setup(<WorkLibrarySelector workId="work-1" />);

    await user.click(screen.getByRole("button", { name: "Alpha Library" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      'The item with identifier "work-1" is not currently available through this library ("Alpha Library").'
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("dismisses the unavailable panel and refocuses search on 'Back to search'", async () => {
    mockLibraries([lib("alpha", "Alpha Library")]);
    fetchMock.mockResponses(
      [
        JSON.stringify({ catalogUrl: "https://alpha.example.com/catalog" }),
        { status: 200 }
      ],
      ["", { status: 404 }]
    );
    const { user } = setup(<WorkLibrarySelector workId="work-1" />);

    await user.click(screen.getByRole("button", { name: "Alpha Library" }));
    await screen.findByRole("alert");

    await user.click(screen.getByRole("button", { name: "Back to search" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: /filter libraries/i })
    ).toHaveFocus();
  });

  it("dismisses the unavailable panel and refocuses the card on 'OK'", async () => {
    mockLibraries([lib("alpha", "Alpha Library")]);
    fetchMock.mockResponses(
      [
        JSON.stringify({ catalogUrl: "https://alpha.example.com/catalog" }),
        { status: 200 }
      ],
      ["", { status: 404 }]
    );
    const { user } = setup(<WorkLibrarySelector workId="work-1" />);

    await user.click(screen.getByRole("button", { name: "Alpha Library" }));
    await screen.findByRole("alert");

    await user.click(screen.getByRole("button", { name: "OK" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Alpha Library" })
      ).toHaveFocus()
    );
  });
});

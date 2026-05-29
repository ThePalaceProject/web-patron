import { openPendingTab } from "utils/window";

function makeMockTab() {
  return {
    opener: undefined as null | undefined,
    close: jest.fn(),
    document: {
      title: "",
      head: { appendChild: jest.fn() },
      body: { appendChild: jest.fn() },
      createElement: jest.fn().mockReturnValue({
        textContent: "",
        style: { cssText: "" },
        name: "",
        content: ""
      })
    },
    location: { href: "" }
  };
}

beforeEach(() => {
  window.open = jest.fn();
  jest.clearAllMocks();
});

describe("openPendingTab", () => {
  test("opens about:blank as a placeholder", () => {
    const mockTab = makeMockTab();
    (window.open as jest.Mock).mockReturnValue(mockTab);
    openPendingTab();
    expect(window.open).toHaveBeenCalledWith("about:blank", "_blank");
  });

  test("sets opener to null to prevent tabnabbing", () => {
    const mockTab = makeMockTab();
    (window.open as jest.Mock).mockReturnValue(mockTab);
    openPendingTab();
    expect(mockTab.opener).toBeNull();
  });

  test("injects a no-referrer meta tag into the placeholder document", () => {
    const mockTab = makeMockTab();
    (window.open as jest.Mock).mockReturnValue(mockTab);
    openPendingTab();
    expect(mockTab.document.createElement).toHaveBeenCalledWith("meta");
    expect(mockTab.document.head.appendChild).toHaveBeenCalled();
  });

  test("shows a loading placeholder in the tab", () => {
    const mockTab = makeMockTab();
    (window.open as jest.Mock).mockReturnValue(mockTab);
    openPendingTab();
    expect(mockTab.document.title).toBe("Loading…");
    expect(mockTab.document.createElement).toHaveBeenCalledWith("p");
    expect(mockTab.document.body.appendChild).toHaveBeenCalled();
  });

  test("navigate() sets the tab location to the given URL", () => {
    const mockTab = makeMockTab();
    (window.open as jest.Mock).mockReturnValue(mockTab);
    const tab = openPendingTab();
    tab.navigate("https://example.com/read-online");
    expect(mockTab.location.href).toBe("https://example.com/read-online");
  });

  test("navigate() falls back to current-tab when popup is blocked", () => {
    (window.open as jest.Mock).mockReturnValue(null);
    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: "" };

    const tab = openPendingTab();
    tab.navigate("https://example.com/read-online");
    expect(window.location.href).toBe("https://example.com/read-online");

    (window as any).location = originalLocation;
  });

  test("close() closes the tab", () => {
    const mockTab = makeMockTab();
    (window.open as jest.Mock).mockReturnValue(mockTab);
    const tab = openPendingTab();
    tab.close();
    expect(mockTab.close).toHaveBeenCalled();
  });

  test("close() is a no-op when popup was blocked", () => {
    (window.open as jest.Mock).mockReturnValue(null);
    const tab = openPendingTab();
    expect(() => tab.close()).not.toThrow();
  });

  test.each([
    ["http://example.com/read-online"],
    ["/read-online"],
    ["javascript:alert(1)"],
    [""]
  ])("navigate() throws when URL is not https (%s)", url => {
    const mockTab = makeMockTab();
    (window.open as jest.Mock).mockReturnValue(mockTab);
    const tab = openPendingTab();
    expect(() => tab.navigate(url)).toThrow(/non-https/);
    expect(mockTab.location.href).toBe("");
  });
});

import * as React from "react";
import { fireEvent, screen, setup } from "test-utils";
import PreviewButton from "components/PreviewButton";

window.open = jest.fn();

function makeMockTab() {
  return {
    document: {
      title: "",
      body: { appendChild: jest.fn() },
      createElement: jest
        .fn()
        .mockReturnValue({ textContent: "", style: { cssText: "" } })
    },
    location: { href: "" }
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders an accessible Preview button", () => {
  setup(<PreviewButton previewUrl="/preview" />);
  expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
});

test("opens about:blank new tab and navigates to previewUrl", () => {
  const mockTab = makeMockTab();
  (window.open as jest.Mock).mockReturnValue(mockTab);

  setup(<PreviewButton previewUrl="/preview" />);
  fireEvent.click(screen.getByRole("button", { name: "Preview" }));

  expect(window.open).toHaveBeenCalledWith("about:blank", "_blank");
  expect(mockTab.document.title).toBe("Loading…");
  expect(mockTab.document.createElement).toHaveBeenCalledWith("p");
  expect(mockTab.document.body.appendChild).toHaveBeenCalled();
  expect(mockTab.location.href).toBe("/preview");
});

test("does not navigate the current tab when new tab opens successfully", () => {
  const mockTab = makeMockTab();
  (window.open as jest.Mock).mockReturnValue(mockTab);

  const originalLocation = window.location;
  delete (window as any).location;
  (window as any).location = { href: "" };

  setup(<PreviewButton previewUrl="/preview" />);
  fireEvent.click(screen.getByRole("button", { name: "Preview" }));

  expect(window.location.href).toBe("");

  (window as any).location = originalLocation;
});

test("falls back to current-tab navigation when popup is blocked", () => {
  (window.open as jest.Mock).mockReturnValue(null);

  const originalLocation = window.location;
  delete (window as any).location;
  (window as any).location = { href: "" };

  setup(<PreviewButton previewUrl="/preview" />);
  fireEvent.click(screen.getByRole("button", { name: "Preview" }));

  expect(window.location.href).toBe("/preview");

  (window as any).location = originalLocation;
});

test("keyboard activation opens preview", async () => {
  const mockTab = makeMockTab();
  (window.open as jest.Mock).mockReturnValue(mockTab);

  const { user } = setup(<PreviewButton previewUrl="/preview" />);
  const button = screen.getByRole("button", { name: "Preview" });
  button.focus();
  await user.keyboard("{Enter}");

  expect(window.open).toHaveBeenCalledWith("about:blank", "_blank");
  expect(mockTab.location.href).toBe("/preview");
});

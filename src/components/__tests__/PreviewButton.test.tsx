import { fireEvent, screen, setup } from "test-utils";
import PreviewButton from "components/PreviewButton";
import { makeMockTab } from "test-utils/mockTab";

window.open = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders an accessible Preview button", () => {
  setup(<PreviewButton previewUrl="https://example.com/preview" />);
  expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
});

test("opens a placeholder tab and navigates it to the preview URL", () => {
  const mockTab = makeMockTab();
  (window.open as jest.Mock).mockReturnValue(mockTab);

  setup(<PreviewButton previewUrl="https://example.com/preview" />);
  fireEvent.click(screen.getByRole("button", { name: "Preview" }));

  expect(window.open).toHaveBeenCalledWith("about:blank", "_blank");
  expect(mockTab.opener).toBeNull();
  expect(mockTab.document.title).toBe("Loading…");
  expect(mockTab.document.createElement).toHaveBeenCalledWith("p");
  expect(mockTab.document.body.appendChild).toHaveBeenCalled();
  expect(mockTab.location.href).toBe("https://example.com/preview");
});

test("does not navigate the current tab when new tab opens successfully", () => {
  const mockTab = makeMockTab();
  (window.open as jest.Mock).mockReturnValue(mockTab);

  const originalLocation = window.location;
  delete (window as any).location;
  (window as any).location = { href: "" };

  setup(<PreviewButton previewUrl="https://example.com/preview" />);
  fireEvent.click(screen.getByRole("button", { name: "Preview" }));

  expect(window.location.href).toBe("");

  (window as any).location = originalLocation;
});

test("falls back to current-tab navigation when popup is blocked", () => {
  (window.open as jest.Mock).mockReturnValue(null);

  const originalLocation = window.location;
  delete (window as any).location;
  (window as any).location = { href: "" };

  setup(<PreviewButton previewUrl="https://example.com/preview" />);
  fireEvent.click(screen.getByRole("button", { name: "Preview" }));

  expect(window.location.href).toBe("https://example.com/preview");

  (window as any).location = originalLocation;
});

test("keyboard activation opens preview", async () => {
  const mockTab = makeMockTab();
  (window.open as jest.Mock).mockReturnValue(mockTab);

  const { user } = setup(
    <PreviewButton previewUrl="https://example.com/preview" />
  );
  const button = screen.getByRole("button", { name: "Preview" });
  button.focus();
  await user.keyboard("{Enter}");

  expect(window.open).toHaveBeenCalledWith("about:blank", "_blank");
  expect(mockTab.location.href).toBe("https://example.com/preview");
});

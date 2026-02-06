import * as React from "react";
import { render, screen, waitFor, fireEvent } from "../../test-utils";
import { AccountMenu } from "../AccountMenu";

function setup(overrideOptions: any = {}) {
  const userEvent = require("@testing-library/user-event").default;
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  return {
    user,
    ...render(<AccountMenu />, overrideOptions)
  };
}

describe("AccountMenu", () => {
  let mockClipboardWriteText: jest.SpyInstance;

  beforeEach(() => {
    // Set isSecureContext to true so clipboard API is used
    Object.defineProperty(window, "isSecureContext", {
      writable: true,
      value: true
    });

    // Ensure navigator.clipboard exists
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: jest.fn().mockResolvedValue(undefined)
        },
        writable: true,
        configurable: true
      });
    }

    // Mock clipboard.writeText using jest.spyOn
    mockClipboardWriteText = jest
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);

    // Also mock document.execCommand as fallback
    document.execCommand = jest.fn(() => true);
  });

  afterEach(() => {
    mockClipboardWriteText?.mockRestore();
    jest.clearAllMocks();
  });

  it("renders account button with icon and text", () => {
    const { getByRole } = render(<AccountMenu />, {
      user: { isAuthenticated: true },
      library: { userProfileUrl: null }
    });
    const button = getByRole("button", { name: /account/i });
    expect(button).toBeInTheDocument();
  });

  it("menu is initially hidden", () => {
    const { queryByRole } = render(<AccountMenu />, {
      user: { isAuthenticated: true },
      library: { userProfileUrl: null }
    });
    expect(queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens menu on button click", async () => {
    const { user, getByRole } = setup({
      user: { isAuthenticated: true },
      library: { userProfileUrl: null }
    });
    const button = getByRole("button", { name: /account/i });
    await user.click(button);
    expect(getByRole("menu")).toBeVisible();
  });

  it("displays patron ID when available", async () => {
    const { user, getByRole, getByText } = setup({
      user: { isAuthenticated: true, patronId: "test-patron-12345" },
      library: { userProfileUrl: null }
    });
    await user.click(getByRole("button", { name: /account/i }));
    expect(getByText(/patron id.*test-patron-12345/i)).toBeInTheDocument();
  });

  it("hides patron ID row when not available", async () => {
    const { user, getByRole, queryByText } = setup({
      user: { isAuthenticated: true, patronId: undefined },
      library: { userProfileUrl: null }
    });
    await user.click(getByRole("button", { name: /account/i }));
    expect(queryByText(/patron id/i)).not.toBeInTheDocument();
  });

  it("copies patron ID to clipboard on click", async () => {
    const { user, getByRole, getByTestId } = setup({
      user: { isAuthenticated: true, patronId: "test-patron-12345" },
      library: { userProfileUrl: null }
    });

    await user.click(getByRole("button", { name: /account/i }));
    const patronIdButton = getByTestId("patron-id-menuitem").querySelector(
      "button"
    ) as HTMLButtonElement;
    fireEvent.click(patronIdButton);

    await waitFor(() => {
      expect(mockClipboardWriteText).toHaveBeenCalledWith(
        "test-patron-12345"
      );
    });
  });

  it("shows copied feedback after successful copy", async () => {
    const { user, getByRole, getByTestId, findByText } = setup({
      user: { isAuthenticated: true, patronId: "test-patron-12345" },
      library: { userProfileUrl: null }
    });

    await user.click(getByRole("button", { name: /account/i }));
    const patronIdButton = getByTestId("patron-id-menuitem").querySelector(
      "button"
    ) as HTMLButtonElement;
    fireEvent.click(patronIdButton);

    expect(await findByText("Copied!")).toBeInTheDocument();
  });

  it("close button closes menu", async () => {
    const { user, getByRole, queryByRole } = setup({
      user: { isAuthenticated: true },
      library: { userProfileUrl: null }
    });

    await user.click(getByRole("button", { name: /account/i }));
    expect(getByRole("menu")).toBeVisible();

    const closeButton = getByRole("button", { name: /close account menu/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("sign out button is visible", async () => {
    const { user, getByRole, getAllByText } = setup({
      user: { isAuthenticated: true, patronId: "test-patron-12345" },
      library: { userProfileUrl: null }
    });

    await user.click(getByRole("button", { name: /account/i }));
    const signOutButtons = getAllByText(/sign out/i);
    // The first one is in the menu
    expect(signOutButtons[0]).toBeInTheDocument();
  });
});

import * as React from "react";
import { act, screen, setup, waitFor } from "test-utils";
import PinButton from "components/PinButton";
import { ANNOUNCE_DELAY_MS } from "components/context/PinnedLibrariesContext";
import { readPinnedLibraries } from "utils/pinnedLibraries";
import {
  HIDE_PUBLIC_WARNING_KEY,
  isPublicWarningHidden
} from "utils/publicWarning";
import { pinLibraries, seedCredentials } from "test-utils/pinning";
import { hasStoredCredentials } from "auth/useCredentials";

const library = {
  id: "urn:uuid:abc",
  slug: "abclib",
  title: "ABC Library"
};

/** Part of the public computer warning's message. */
const WARNING_TEXT = /public or shared computer/;

const pinButton = () =>
  screen.getByRole("button", { name: "Pin ABC Library to My Libraries" });
const unpinButton = () =>
  screen.getByRole("button", { name: "Unpin ABC Library from My Libraries" });

test("renders nothing when pinning is disabled", () => {
  pinLibraries(library);
  setup(<PinButton library={library} />, {
    appConfig: { enablePinning: false }
  });
  expect(screen.queryByRole("button")).toBeNull();
});

test("first pin shows the public computer warning and pins on confirm", async () => {
  const { user } = setup(<PinButton library={library} />);

  await user.click(pinButton());
  expect(screen.getByText(WARNING_TEXT)).toBeInTheDocument();
  expect(readPinnedLibraries()).toEqual([]);

  await user.click(screen.getByRole("button", { name: "Pin Library" }));

  expect(readPinnedLibraries()[0]).toMatchObject(library);
  expect(isPublicWarningHidden()).toBe(false);
  expect(unpinButton()).toBeInTheDocument();
});

test("canceling the warning does not pin", async () => {
  const { user } = setup(<PinButton library={library} />);

  await user.click(pinButton());
  await user.click(screen.getByRole("button", { name: "Cancel" }));

  expect(readPinnedLibraries()).toEqual([]);
  await waitFor(() => expect(screen.queryByText(WARNING_TEXT)).toBeNull());
});

test("checking the opt-out stores the preference and skips future warnings", async () => {
  const { user } = setup(<PinButton library={library} />);

  await user.click(pinButton());
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Pin Library" }));

  expect(isPublicWarningHidden()).toBe(true);
  await waitFor(() => expect(screen.queryByText(WARNING_TEXT)).toBeNull());

  // A later pin goes straight through with no warning.
  await user.click(unpinButton());
  expect(readPinnedLibraries()).toEqual([]);
  await user.click(pinButton());
  expect(screen.queryByText(WARNING_TEXT)).toBeNull();
  expect(readPinnedLibraries()[0]).toMatchObject(library);
});

test("pins without warning when the preference is already stored", async () => {
  localStorage.setItem(HIDE_PUBLIC_WARNING_KEY, "true");
  const { user } = setup(<PinButton library={library} />);

  await user.click(pinButton());

  expect(screen.queryByText(WARNING_TEXT)).toBeNull();
  expect(readPinnedLibraries()[0]).toMatchObject(library);
});

test("unpins directly when not signed in", async () => {
  pinLibraries(library);
  const { user } = setup(<PinButton library={library} />);

  await user.click(unpinButton());

  expect(readPinnedLibraries()).toEqual([]);
  expect(screen.queryByText(/Unpinning will sign you out/)).toBeNull();
});

test("unpinning while signed in asks for confirmation, then signs out and unpins", async () => {
  pinLibraries(library);
  seedCredentials(library.slug);
  const { user } = setup(<PinButton library={library} />);

  await user.click(unpinButton());

  expect(
    screen.getByText(
      "You are signed in to ABC Library. Unpinning will sign you out."
    )
  ).toBeInTheDocument();
  expect(readPinnedLibraries()).toHaveLength(1);

  await user.click(screen.getByRole("button", { name: "Unpin and Sign Out" }));

  expect(readPinnedLibraries()).toEqual([]);
  expect(hasStoredCredentials(library.slug)).toBe(false);
});

test("canceling the unpin confirmation keeps the pin and credentials", async () => {
  pinLibraries(library);
  seedCredentials(library.slug);
  const { user } = setup(<PinButton library={library} />);

  await user.click(unpinButton());
  await user.click(screen.getByRole("button", { name: "Cancel" }));

  expect(readPinnedLibraries()).toHaveLength(1);
  expect(hasStoredCredentials(library.slug)).toBe(true);
});

test("uses the provided signOut instead of clearing storage directly", async () => {
  pinLibraries(library);
  seedCredentials(library.slug);
  const signOut = jest.fn();
  const { user } = setup(<PinButton library={library} signOut={signOut} />);

  await user.click(unpinButton());
  await user.click(screen.getByRole("button", { name: "Unpin and Sign Out" }));

  expect(signOut).toHaveBeenCalledTimes(1);
  expect(readPinnedLibraries()).toEqual([]);
});

test("the warning dialog is named and described by its visible text", async () => {
  const { user } = setup(<PinButton library={library} />);

  await user.click(pinButton());

  const dialog = screen.getByRole("alertdialog", { name: "Pin this library?" });
  expect(dialog).toHaveAccessibleDescription(
    "Pinning a library saves it in this browser. Do not pin libraries on a public or shared computer."
  );
});

test("the unpin dialog is named and described by its visible text", async () => {
  pinLibraries(library);
  seedCredentials(library.slug);
  const { user } = setup(<PinButton library={library} />);

  await user.click(unpinButton());

  const dialog = screen.getByRole("alertdialog", { name: "Unpin Library" });
  expect(dialog).toHaveAccessibleDescription(
    "You are signed in to ABC Library. Unpinning will sign you out."
  );
});

test("the opt-out checkbox is cleared when the warning reopens", async () => {
  const { user } = setup(<PinButton library={library} />);

  await user.click(pinButton());
  await user.click(
    screen.getByRole("checkbox", { name: "Do not show this again." })
  );
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  await user.click(pinButton());

  expect(
    screen.getByRole("checkbox", { name: "Do not show this again." })
  ).not.toBeChecked();
});

describe("onToggle", () => {
  test("is called after a direct pin", async () => {
    localStorage.setItem(HIDE_PUBLIC_WARNING_KEY, "true");
    const onToggle = jest.fn();
    const { user } = setup(<PinButton library={library} onToggle={onToggle} />);

    await user.click(pinButton());

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test("is called after confirming the warning", async () => {
    const onToggle = jest.fn();
    const { user } = setup(<PinButton library={library} onToggle={onToggle} />);

    await user.click(pinButton());
    await user.click(screen.getByRole("button", { name: "Pin Library" }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test("is called after confirming a signed-in unpin", async () => {
    pinLibraries(library);
    seedCredentials(library.slug);
    const onToggle = jest.fn();
    const { user } = setup(<PinButton library={library} onToggle={onToggle} />);

    await user.click(unpinButton());
    await user.click(
      screen.getByRole("button", { name: "Unpin and Sign Out" })
    );

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test.each([
    ["the warning", false],
    ["the signed-in unpin", true]
  ])("is not called when %s is cancelled", async (_, signedIn) => {
    if (signedIn) {
      pinLibraries(library);
      seedCredentials(library.slug);
    }
    const onToggle = jest.fn();
    const { user } = setup(<PinButton library={library} onToggle={onToggle} />);

    await user.click(signedIn ? unpinButton() : pinButton());
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onToggle).not.toHaveBeenCalled();
  });
});

describe("announcements", () => {
  const PINNED = "ABC Library pinned to My Libraries.";
  const UNPINNED = "ABC Library unpinned from My Libraries.";

  /** Waits out the announcement delay. */
  function flushAnnouncement() {
    act(() => {
      jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
    });
  }

  test("announces a direct pin", async () => {
    localStorage.setItem(HIDE_PUBLIC_WARNING_KEY, "true");
    const { user } = setup(<PinButton library={library} />);

    await user.click(pinButton());
    flushAnnouncement();

    expect(screen.getByRole("status")).toHaveTextContent(PINNED);
  });

  test("announces a pin confirmed in the warning dialog", async () => {
    const { user } = setup(<PinButton library={library} />);

    await user.click(pinButton());
    await user.click(screen.getByRole("button", { name: "Pin Library" }));
    flushAnnouncement();

    expect(screen.getByRole("status")).toHaveTextContent(PINNED);
  });

  test("announces a direct unpin, with the empty-list note on the last one", async () => {
    pinLibraries(library);
    const { user } = setup(<PinButton library={library} />);

    await user.click(unpinButton());
    flushAnnouncement();

    expect(screen.getByRole("status")).toHaveTextContent(
      `${UNPINNED} No libraries are pinned.`
    );
  });

  test("does not announce the empty-list note while other pins remain", async () => {
    pinLibraries(library, {
      id: "urn:uuid:other",
      slug: "otherlib",
      title: "Other Library"
    });
    const { user } = setup(<PinButton library={library} />);

    await user.click(unpinButton());
    flushAnnouncement();

    expect(screen.getByRole("status")).toHaveTextContent(UNPINNED);
    expect(screen.getByRole("status")).not.toHaveTextContent(
      "No libraries are pinned."
    );
  });

  test("announces an unpin confirmed in the sign-out dialog", async () => {
    pinLibraries(library);
    seedCredentials(library.slug);
    const { user } = setup(<PinButton library={library} />);

    await user.click(unpinButton());
    await user.click(
      screen.getByRole("button", { name: "Unpin and Sign Out" })
    );
    flushAnnouncement();

    expect(screen.getByRole("status")).toHaveTextContent(UNPINNED);
  });

  test("has no announcement region when pinning is disabled", () => {
    setup(<PinButton library={library} />, {
      appConfig: { enablePinning: false }
    });
    expect(screen.queryByRole("status")).toBeNull();
  });
});

import * as React from "react";
import { act, render, screen, setup } from "test-utils";
import PinnedLibraryList, {
  useShownPinnedLibraries
} from "components/PinnedLibraryList";
import { usePinnedLibraries } from "components/context/PinnedLibrariesContext";
import {
  PINNED_LIBRARIES_KEY,
  readPinnedLibraries,
  writePinnedLibraries
} from "utils/pinnedLibraries";
import { pinLibraries } from "test-utils/pinning";
import {
  HIDE_PUBLIC_WARNING_KEY,
  hidePublicWarning,
  isPublicWarningHidden
} from "utils/publicWarning";
import type { ClientLibrary } from "pages/api/libraries";

function lib(slug: string, extra?: Partial<ClientLibrary>): ClientLibrary {
  return {
    id: `urn:${slug}`,
    slug,
    title: `${slug} Library`,
    authDocUrl: `https://example.com/${slug}/auth`,
    ...extra
  };
}

function pin(...slugs: string[]) {
  pinLibraries(...slugs.map(slug => lib(slug)));
}

/** PinnedLibraryList fed by useShownPinnedLibraries, as the pickers use it. */
const Section: React.FC<
  Omit<React.ComponentProps<typeof PinnedLibraryList>, "pinned">
> = props => {
  const pinned = useShownPinnedLibraries(props.libraries);
  return <PinnedLibraryList {...props} pinned={pinned} />;
};

const renderTitle = (library: ClientLibrary) => <span>{library.title}</span>;

/** A card whose button unpins its library, for the focus tests. */
const UnpinItem: React.FC<{
  library: ClientLibrary;
  /** Marks the button with its library, as PinButton does. */
  tagged?: boolean;
}> = ({ library, tagged = false }) => {
  const { unpinLibrary, markFocusOrigin } = usePinnedLibraries();
  return (
    <button
      data-pin-library={tagged ? library.id : undefined}
      onClick={event => {
        markFocusOrigin(event.currentTarget);
        unpinLibrary(library.id);
      }}
    >
      Unpin {library.title}
    </button>
  );
};

test("renders nothing when no library is pinned", () => {
  render(<Section libraries={[lib("alpha")]} renderItem={renderTitle} />);
  expect(screen.queryByRole("heading", { name: "My Libraries" })).toBeNull();
});

test("renders nothing when pinning is disabled", () => {
  pin("alpha");
  render(<Section libraries={[lib("alpha")]} renderItem={renderTitle} />, {
    appConfig: { enablePinning: false }
  });
  expect(screen.queryByRole("heading", { name: "My Libraries" })).toBeNull();
  expect(screen.queryByText("alpha Library")).toBeNull();
});

test("lists pinned libraries in pinned order and omits unavailable ones", () => {
  pin("gamma", "missing", "alpha");
  render(
    <Section
      libraries={[lib("alpha"), lib("beta"), lib("gamma")]}
      renderItem={renderTitle}
    />
  );

  expect(
    screen.getByRole("heading", { name: "My Libraries" })
  ).toBeInTheDocument();
  expect(screen.getAllByRole("listitem").map(item => item.textContent)).toEqual(
    ["gamma Library", "alpha Library"]
  );
});

test("uses the stored logo when the server list has none", () => {
  writePinnedLibraries([
    {
      id: "urn:alpha",
      slug: "alpha",
      title: "alpha Library",
      logoUrl: "https://example.com/stored.png",
      pinnedAt: 1000
    }
  ]);
  const renderItem = jest.fn(renderTitle);
  render(<Section libraries={[lib("alpha")]} renderItem={renderItem} />);
  expect(renderItem).toHaveBeenLastCalledWith(
    expect.objectContaining({ logoUrl: "https://example.com/stored.png" })
  );
});

test("refreshes stored entries from the server list", () => {
  pin("alpha");
  render(
    <Section
      libraries={[lib("alpha", { slug: "renamed", title: "Renamed" })]}
      renderItem={renderTitle}
    />
  );
  expect(readPinnedLibraries()[0]).toMatchObject({
    slug: "renamed",
    title: "Renamed"
  });
});

describe("focus after unpinning a focused card", () => {
  test("moves to the section heading when the control names no library", async () => {
    pin("alpha", "beta");
    const { user } = setup(
      <Section
        libraries={[lib("alpha"), lib("beta")]}
        renderItem={library => <UnpinItem library={library} />}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Unpin alpha Library" })
    );

    expect(screen.getByRole("heading", { name: "My Libraries" })).toHaveFocus();
  });

  test.each([true, false])(
    "moves to emptyFocusRef after the last unpin when no other pin button exists (tagged: %p)",
    async tagged => {
      pin("alpha");
      const Page = () => {
        const fallbackRef = React.useRef<HTMLHeadingElement>(null);
        return (
          <>
            <Section
              libraries={[lib("alpha")]}
              renderItem={library => (
                <UnpinItem library={library} tagged={tagged} />
              )}
              emptyFocusRef={fallbackRef}
            />
            <h2 ref={fallbackRef} tabIndex={-1}>
              Choose a library:
            </h2>
          </>
        );
      };
      const { user } = setup(<Page />);

      await user.click(
        screen.getByRole("button", { name: "Unpin alpha Library" })
      );

      expect(
        screen.getByRole("heading", { name: "Choose a library:" })
      ).toHaveFocus();
    }
  );

  test("returns to a surviving control that lost focus", async () => {
    pin("alpha");
    const PinBeta: React.FC = () => {
      const { pinLibrary, markFocusOrigin } = usePinnedLibraries();
      return (
        <button
          onClick={event => {
            markFocusOrigin(event.currentTarget);
            // Some browsers leave focus on the body after a click.
            event.currentTarget.blur();
            pinLibrary(lib("beta"));
          }}
        >
          Pin beta
        </button>
      );
    };
    const { user } = setup(
      <>
        <Section
          libraries={[lib("alpha"), lib("beta")]}
          renderItem={renderTitle}
        />
        <PinBeta />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Pin beta" }));

    expect(screen.getByRole("button", { name: "Pin beta" })).toHaveFocus();
  });

  test("does not move focus for a change made in another tab", () => {
    pin("alpha", "beta");
    render(
      <Section
        libraries={[lib("alpha"), lib("beta")]}
        renderItem={renderTitle}
      />
    );
    expect(document.body).toHaveFocus();

    pin("alpha");
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: PINNED_LIBRARIES_KEY })
      );
    });

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(document.body).toHaveFocus();
  });

  test("does not move focus when stored pins load", () => {
    pin("alpha");
    render(<Section libraries={[lib("alpha")]} renderItem={renderTitle} />);

    expect(
      screen.getByRole("heading", { name: "My Libraries" })
    ).toBeInTheDocument();
    expect(document.body).toHaveFocus();
  });
});

describe("shared computer warning reset", () => {
  const resetName = "Reset the shared computer warning";

  test("is not offered while the warning is on", () => {
    pin("alpha");
    render(<Section libraries={[lib("alpha")]} renderItem={renderTitle} />);
    expect(screen.queryByRole("button", { name: resetName })).toBeNull();
  });

  test("appears when the warning is turned off", () => {
    pin("alpha");
    render(<Section libraries={[lib("alpha")]} renderItem={renderTitle} />);

    act(() => hidePublicWarning());

    expect(screen.getByRole("button", { name: resetName })).toBeInTheDocument();
  });

  test("appears when another tab turns the warning off", () => {
    pin("alpha");
    render(<Section libraries={[lib("alpha")]} renderItem={renderTitle} />);

    localStorage.setItem(HIDE_PUBLIC_WARNING_KEY, "true");
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: HIDE_PUBLIC_WARNING_KEY })
      );
    });

    expect(screen.getByRole("button", { name: resetName })).toBeInTheDocument();
  });

  test("turns the warning back on and moves focus to the heading", async () => {
    pin("alpha");
    hidePublicWarning();
    const { user } = setup(
      <Section libraries={[lib("alpha")]} renderItem={renderTitle} />
    );

    await user.click(screen.getByRole("button", { name: resetName }));

    expect(isPublicWarningHidden()).toBe(false);
    expect(screen.queryByRole("button", { name: resetName })).toBeNull();
    expect(screen.getByRole("heading", { name: "My Libraries" })).toHaveFocus();
  });
});

test("ignores reordering when the page does not handle it", () => {
  pin("alpha", "beta");
  render(
    <Section
      libraries={[lib("alpha"), lib("beta")]}
      renderItem={(library, reorderControls) => (
        <span>
          {library.title}
          {reorderControls}
        </span>
      )}
      reordering
    />
  );

  expect(screen.queryByRole("button", { name: /Reorder/ })).toBeNull();
  expect(screen.queryByRole("button", { name: /^Move / })).toBeNull();
});

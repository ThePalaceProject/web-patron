import * as React from "react";
import { act, screen, setup } from "test-utils";
import type { DragEndEvent } from "@dnd-kit/core";
import PinnedLibraryList, {
  useShownPinnedLibraries
} from "components/PinnedLibraryList";
import { ANNOUNCE_DELAY_MS } from "components/context/PinnedLibrariesContext";
import { pinLibraries } from "test-utils/pinning";
import { readPinnedLibraries } from "utils/pinnedLibraries";
import type { ClientLibrary } from "pages/api/libraries";

/*
 * jsdom cannot perform a pointer drag, so the real DndContext renders and
 * its onDragEnd handler is captured to simulate a drop.
 */
let mockDragEnd: ((event: DragEndEvent) => void) | undefined;
jest.mock("@dnd-kit/core", () => {
  const actual = jest.requireActual("@dnd-kit/core");
  const { createElement } = jest.requireActual("react");
  return {
    ...actual,
    DndContext: (props: { onDragEnd: (event: DragEndEvent) => void }) => {
      mockDragEnd = props.onDragEnd;
      return createElement(actual.DndContext, props);
    }
  };
});

function lib(slug: string): ClientLibrary {
  return {
    id: `urn:${slug}`,
    slug,
    title: `${slug} Library`,
    authDocUrl: `https://example.com/${slug}/auth`
  };
}

const libraries = [lib("alpha"), lib("beta"), lib("gamma")];

const Section: React.FC = () => {
  const pinned = useShownPinnedLibraries(libraries);
  return (
    <PinnedLibraryList
      libraries={libraries}
      pinned={pinned}
      renderItem={(library, reorderControls) => (
        <span>
          {library.title}
          {reorderControls}
        </span>
      )}
      reorderable
    />
  );
};

/** Simulates dropping `activeId` onto `overId`, or onto nothing. */
function drop(activeId: string, overId: string | null) {
  act(() =>
    mockDragEnd?.({
      active: { id: activeId },
      over: overId === null ? null : { id: overId }
    } as unknown as DragEndEvent)
  );
}

const pinnedOrder = () => readPinnedLibraries().map(entry => entry.slug);

async function startReordering() {
  pinLibraries(...libraries);
  const utils = setup(<Section />);
  await utils.user.click(
    screen.getByRole("button", { name: "Reorder My Libraries" })
  );
  return utils;
}

test("dropping a library onto another moves it there and announces it", async () => {
  await startReordering();

  drop("urn:alpha", "urn:gamma");
  act(() => {
    jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
  });

  expect(pinnedOrder()).toEqual(["beta", "gamma", "alpha"]);
  expect(document.querySelector("body > [role='status']")).toHaveTextContent(
    "alpha Library moved to position 3 of 3."
  );
});

test.each([
  ["onto nothing", null],
  ["onto itself", "urn:alpha"]
])("dropping %s changes nothing", async (_, overId) => {
  await startReordering();

  drop("urn:alpha", overId);

  expect(pinnedOrder()).toEqual(["alpha", "beta", "gamma"]);
});

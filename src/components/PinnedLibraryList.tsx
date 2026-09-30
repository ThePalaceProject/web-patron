import * as React from "react";
import type { ClientLibrary } from "pages/api/libraries";
import Button from "components/Button";
import LibraryCardList, {
  LIBRARY_CARD_LIST_MAX_WIDTH
} from "components/LibraryCardList";
import {
  MOVE_ATTRIBUTE,
  type MoveDirection,
  ReorderControls,
  SortablePinnedItem,
  moveButtonKey
} from "components/PinnedLibraryReorder";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import usePublicWarningHidden from "hooks/usePublicWarningHidden";
import { showPublicWarning } from "utils/publicWarning";
import {
  usePinnedLibraries,
  usePinningEnabled
} from "components/context/PinnedLibrariesContext";
import { useTranslation } from "next-i18next/pages";

interface PinnedLibraryListProps {
  /** The current server library list. */
  libraries: ClientLibrary[];
  /** The pinned libraries to show, from `useShownPinnedLibraries`. */
  pinned: ClientLibrary[];
  /**
   * Renders the card for one pinned library. In reorder mode it receives the
   * reorder controls, to show in place of the card's usual trailing
   * content.
   */
  renderItem: (
    library: ClientLibrary,
    reorderControls?: React.ReactNode
  ) => React.ReactNode;
  /**
   * Whether the list is in reorder mode, with Move up and Move down buttons
   * and pointer dragging. Takes effect only with `onReorderingChange` and
   * two or more shown libraries.
   */
  reordering?: boolean;
  /**
   * Called by the Reorder and Done button, which the list shows when this
   * is given and two or more pinned libraries are shown.
   */
  onReorderingChange?: (reordering: boolean) => void;
  /**
   * Receives focus after the last unpin, so the user lands somewhere
   * predictable (e.g. the library search input) instead of wherever the
   * unpinned library's other pin button sits. Should be focusable.
   */
  emptyFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * The pinned libraries to show, in pinned order, resolved by id against the
 * current server library list. Pinned libraries missing from that list are
 * left out. Empty when pinning is disabled. The logo falls back to the one
 * stored with the pin.
 */
export function useShownPinnedLibraries(
  libraries: ClientLibrary[]
): ClientLibrary[] {
  const pinningEnabled = usePinningEnabled();
  const { pinnedLibraries } = usePinnedLibraries();
  if (!pinningEnabled) return [];
  const librariesById = new Map(libraries.map(lib => [lib.id, lib]));
  return pinnedLibraries.flatMap(entry => {
    const library = librariesById.get(entry.id);
    if (!library) return [];
    return [{ ...library, logoUrl: library.logoUrl ?? entry.logoUrl }];
  });
}

const displayName = (library: ClientLibrary) => library.title || library.slug;

/**
 * The "My Libraries" section. Renders nothing when `pinned` is empty. Also
 * refreshes the stored pinned entries from the server list. While the
 * public computer warning is turned off, offers to turn it back on. With
 * `onReorderingChange` and two or more shown libraries, a Reorder and Done
 * button toggles `reordering`, which shows move controls and allows pointer
 * dragging.
 *
 * When a pin or unpin made in this page leaves focus nowhere, focus returns
 * to the control that made it. If that control is gone, focus moves to the
 * library's pin button in this list after a pin, or to a neighboring
 * library's pin button after an unpin, or to the section heading when no
 * such button exists. After the last unpin, it moves to `emptyFocusRef`,
 * or to that library's pin button elsewhere on the page.
 */
const PinnedLibraryList: React.FC<PinnedLibraryListProps> = ({
  libraries,
  pinned,
  renderItem,
  reordering = false,
  onReorderingChange,
  emptyFocusRef
}) => {
  const { t } = useTranslation();
  const {
    pinnedLibraries,
    syncWithAvailable,
    takeFocusOrigin,
    movePinnedLibrary,
    announce
  } = usePinnedLibraries();

  // Also reruns when the pinned list changes, so entries read from storage
  // after this list mounted get refreshed too. A sync with nothing to change
  // does not update state.
  React.useEffect(() => {
    syncWithAvailable(libraries);
  }, [libraries, pinnedLibraries, syncWithAvailable]);

  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const sectionRef = React.useRef<HTMLElement>(null);
  const warningHidden = usePublicWarningHidden();

  const restoreWarning = () => {
    showPublicWarning();
    // The button removes itself, so keep focus in the section.
    headingRef.current?.focus();
  };
  const shownCount = pinned.length;

  // A string, so the effect below runs only when the shown ids change.
  const pinnedIdsKey = JSON.stringify(pinned.map(library => library.id));
  const previousIds = React.useRef<string[]>(JSON.parse(pinnedIdsKey));
  React.useEffect(() => {
    const pinnedIds: string[] = JSON.parse(pinnedIdsKey);
    const removedFrom = previousIds.current;
    previousIds.current = pinnedIds;
    const origin = takeFocusOrigin();
    if (!origin || pinnedIds.length === removedFrom.length) return;

    const pinButtonIn = (
      root: ParentNode | null | undefined,
      libraryId: string | undefined
    ) =>
      Array.from(
        root?.querySelectorAll<HTMLElement>("[data-pin-library]") ?? []
      ).find(button => libraryId && button.dataset.pinLibrary === libraryId);
    const pinButtonFor = (libraryId: string | undefined) =>
      pinButtonIn(sectionRef.current, libraryId);

    // Picks the replacement described in the component comment.
    const replacementFor = (libraryId: string | null) => {
      if (!libraryId) return headingRef.current ?? emptyFocusRef?.current;
      const pinnedButton = pinButtonFor(libraryId);
      if (pinnedButton) return pinnedButton;
      if (pinnedIds.length === 0) {
        return emptyFocusRef?.current ?? pinButtonIn(document, libraryId);
      }
      const removedAt = removedFrom.indexOf(libraryId);
      const neighbor = pinnedIds[Math.min(removedAt, pinnedIds.length - 1)];
      return pinButtonFor(neighbor) ?? headingRef.current;
    };

    const active = document.activeElement;
    if (active && active !== document.body) return;
    if (origin.isConnected) {
      origin.focus();
      return;
    }
    replacementFor(origin.getAttribute("data-pin-library"))?.focus();
  }, [pinnedIdsKey, emptyFocusRef, takeFocusOrigin]);

  const canReorder = onReorderingChange !== undefined && shownCount > 1;
  const isReordering = canReorder && reordering;

  // A move reorders the list items, which can drop focus from the pressed
  // Move button, so the button is focused again after the move renders.
  const refocusKey = React.useRef<string>(undefined);
  React.useLayoutEffect(() => {
    const key = refocusKey.current;
    if (!key) return;
    refocusKey.current = undefined;
    const button = Array.from(
      sectionRef.current?.querySelectorAll<HTMLElement>(
        `[${MOVE_ATTRIBUTE}]`
      ) ?? []
    ).find(element => element.getAttribute(MOVE_ATTRIBUTE) === key);
    if (button && document.activeElement !== button) button.focus();
  });

  // Moves `library` to the shown position of the library with `targetId`.
  const move = (library: ClientLibrary, targetId: string) => {
    const position = pinned.findIndex(entry => entry.id === targetId);
    if (position === -1 || targetId === library.id) return;
    movePinnedLibrary(library.id, targetId);
    announce(
      t(
        "pinnedLibraryList.moved",
        "{{title}} moved to position {{position}} of {{total}}.",
        {
          title: displayName(library),
          position: position + 1,
          total: shownCount
        }
      )
    );
  };

  const moveByButton = (
    library: ClientLibrary,
    index: number,
    direction: MoveDirection
  ) => {
    const target = pinned[direction === "up" ? index - 1 : index + 1];
    if (!target) return;
    refocusKey.current = moveButtonKey(direction, library.id);
    move(library, target.id);
  };

  // Dragging starts only after the pointer moves a few pixels, so a click
  // on the drag handle does nothing.
  const dragSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const library = pinned.find(entry => entry.id === active.id);
    if (over && library) move(library, String(over.id));
  };

  if (shownCount === 0) return null;

  const items = pinned.map((library, index) =>
    isReordering ? (
      <SortablePinnedItem key={library.id} id={library.id}>
        {dragHandleProps =>
          renderItem(
            library,
            <ReorderControls
              libraryId={library.id}
              title={displayName(library)}
              atTop={index === 0}
              atBottom={index === shownCount - 1}
              onMove={direction => moveByButton(library, index, direction)}
              dragHandleProps={dragHandleProps}
            />
          )
        }
      </SortablePinnedItem>
    ) : (
      <li key={library.id}>{renderItem(library)}</li>
    )
  );

  return (
    <section ref={sectionRef}>
      <div
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          maxWidth: LIBRARY_CARD_LIST_MAX_WIDTH
        }}
      >
        <h2 ref={headingRef} tabIndex={-1}>
          {t("library.myLibraries", "My Libraries", { ns: "common" })}
        </h2>
        {canReorder && (
          <Button
            variant="ghost"
            color="ui.black"
            onClick={() => onReorderingChange?.(!isReordering)}
            aria-label={
              isReordering
                ? t(
                    "pinnedLibraryList.doneLabel",
                    "Done reordering My Libraries"
                  )
                : t("pinnedLibraryList.reorderLabel", "Reorder My Libraries")
            }
          >
            {isReordering
              ? t("pinnedLibraryList.done", "Done")
              : t("pinnedLibraryList.reorder", "Reorder")}
          </Button>
        )}
      </div>
      {warningHidden && (
        <Button
          variant="link"
          color="ui.link.primary"
          onClick={restoreWarning}
          sx={{ mb: 2 }}
        >
          {t(
            "pinnedLibraryList.resetWarning",
            "Reset the shared computer warning"
          )}
        </Button>
      )}
      {isReordering ? (
        <DndContext
          sensors={dragSensors}
          modifiers={[restrictToVerticalAxis]}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          accessibility={{
            // Dragging is pointer-only and the handle is hidden from
            // assistive technology, so dnd-kit's own English announcements
            // are silenced in favor of the localized move announcement.
            announcements: {
              onDragStart: () => undefined,
              onDragOver: () => undefined,
              onDragEnd: () => undefined,
              onDragCancel: () => undefined
            },
            screenReaderInstructions: { draggable: "" }
          }}
        >
          <SortableContext
            items={pinned.map(library => library.id)}
            strategy={verticalListSortingStrategy}
          >
            <LibraryCardList>{items}</LibraryCardList>
          </SortableContext>
        </DndContext>
      ) : (
        <LibraryCardList>{items}</LibraryCardList>
      )}
    </section>
  );
};

export default PinnedLibraryList;

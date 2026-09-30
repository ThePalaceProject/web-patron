import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faGripVertical
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "next-i18next/pages";
import { MIN_TOUCH_TARGET_PX } from "constants/a11y";

/** Marks a move button with its library and direction, to refocus it. */
export const MOVE_ATTRIBUTE = "data-move";

export type MoveDirection = "up" | "down";

/** The MOVE_ATTRIBUTE value of a library's move button. */
export function moveButtonKey(direction: MoveDirection, libraryId: string) {
  return `${direction} ${libraryId}`;
}

type DragHandleProps = ReturnType<typeof useSortable>["listeners"];

interface SortablePinnedItemProps {
  id: string;
  /** Renders the item's content, given the listeners for its drag handle. */
  children: (dragHandleProps: DragHandleProps) => React.ReactNode;
}

/**
 * A pinned library list item that can be dragged with a pointer from its
 * drag handle. Keyboard users move items with the move buttons instead, so
 * the item itself gets no keyboard drag behavior.
 */
export const SortablePinnedItem: React.FC<SortablePinnedItemProps> = ({
  id,
  children
}) => {
  const { listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      // Translate only: the full transform also scales to the displaced
      // item's size, which stretches a dragged card whose title wraps
      // differently.
      style={{ transform: CSS.Translate.toString(transform), transition }}
      sx={
        isDragging
          ? // Above the other cards' trailing controls, which use zIndex 1.
            { opacity: 0.75, position: "relative", zIndex: 2 }
          : undefined
      }
    >
      {children(listeners)}
    </li>
  );
};

interface ReorderControlsProps {
  libraryId: string;
  title: string;
  atTop: boolean;
  atBottom: boolean;
  onMove: (direction: MoveDirection) => void;
  dragHandleProps: DragHandleProps;
}

/**
 * A drag handle for pointer users and stacked Move up and Move down buttons
 * for keyboard users. At either end of the list the matching button is
 * aria-disabled rather than disabled, so it keeps focus after a move.
 */
export const ReorderControls: React.FC<ReorderControlsProps> = ({
  libraryId,
  title,
  atTop,
  atBottom,
  onMove,
  dragHandleProps
}) => {
  const { t } = useTranslation();

  return (
    <span sx={{ display: "flex", alignItems: "center" }}>
      <span
        {...dragHandleProps}
        aria-hidden="true"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: MIN_TOUCH_TARGET_PX,
          height: MIN_TOUCH_TARGET_PX,
          cursor: "grab",
          touchAction: "none",
          color: "ui.gray.dark"
        }}
      >
        <FontAwesomeIcon icon={faGripVertical} />
      </span>
      <span sx={{ display: "flex", flexDirection: "column" }}>
        <MoveButton
          libraryId={libraryId}
          direction="up"
          label={t("pinnedLibraryList.moveUp", "Move {{title}} up", {
            title
          })}
          atEdge={atTop}
          onMove={() => onMove("up")}
        />
        <MoveButton
          libraryId={libraryId}
          direction="down"
          label={t("pinnedLibraryList.moveDown", "Move {{title}} down", {
            title
          })}
          atEdge={atBottom}
          onMove={() => onMove("down")}
        />
      </span>
    </span>
  );
};

const MoveButton: React.FC<{
  libraryId: string;
  direction: MoveDirection;
  label: string;
  atEdge: boolean;
  onMove: () => void;
}> = ({ libraryId, direction, label, atEdge, onMove }) => (
  <button
    type="button"
    {...{ [MOVE_ATTRIBUTE]: moveButtonKey(direction, libraryId) }}
    aria-label={label}
    title={label}
    aria-disabled={atEdge}
    onClick={atEdge ? undefined : onMove}
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: MIN_TOUCH_TARGET_PX,
      height: 24,
      p: 0,
      border: "none",
      borderRadius: "button",
      bg: "transparent",
      color: atEdge ? "ui.gray.medium" : "ui.black",
      cursor: atEdge ? "not-allowed" : "pointer",
      "&:hover": atEdge ? {} : { bg: "ui.gray.extraLight" },
      // Matches the focus style of the app's Button.
      "&:focus": { boxShadow: "focus", outline: "none" }
    }}
  >
    <FontAwesomeIcon icon={direction === "up" ? faChevronUp : faChevronDown} />
  </button>
);

import * as React from "react";
import { useDialogStore } from "@ariakit/react/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbtack } from "@fortawesome/free-solid-svg-icons";
import Button from "components/Button";
import PublicComputerWarning from "components/PublicComputerWarning";
import UnpinConfirmationDialog from "components/UnpinConfirmationDialog";
import {
  usePinnedLibraries,
  usePinningEnabled,
  PinnableLibrary
} from "components/context/PinnedLibrariesContext";
import { isPublicWarningHidden, hidePublicWarning } from "utils/publicWarning";
import {
  hasStoredCredentials,
  clearStoredCredentials
} from "auth/useCredentials";
import { useTranslation } from "next-i18next/pages";

export type { PinnableLibrary };

interface PinButtonProps {
  library: PinnableLibrary;
  /**
   * Signs the user out when they confirm unpinning while signed in. Pass
   * `useSignOutFlow()` inside the library's provider tree, so the full
   * sign-out flow runs. Without it, only the library's stored credentials
   * are cleared, with no server-side logout.
   */
  signOut?: () => void | Promise<void>;
  /** Called after this button pins or unpins its library. */
  onToggle?: () => void;
  className?: string;
}

/**
 * Toggles a library's pinned state. Pinning shows the public computer
 * warning unless the user opted out; unpinning while signed in asks for
 * confirmation and then signs the user out. Renders nothing when the
 * pinning feature flag is off.
 */
const PinButton: React.FC<PinButtonProps> = ({
  library,
  signOut,
  onToggle,
  className
}) => {
  const { t } = useTranslation();
  const pinningEnabled = usePinningEnabled();
  const {
    isPinned,
    pinnedLibraries,
    pinLibrary,
    unpinLibrary,
    markFocusOrigin,
    announce
  } = usePinnedLibraries();
  const warningDialog = useDialogStore();
  const unpinDialog = useDialogStore();
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const pinned = isPinned(library.id);

  const pin = () => {
    markFocusOrigin(buttonRef.current);
    pinLibrary(library);
    announce(
      t("pinButton.pinned", "{{title}} pinned to My Libraries.", {
        title: library.title
      })
    );
    onToggle?.();
  };

  const unpin = () => {
    const wasLast = pinnedLibraries.length === 1;
    markFocusOrigin(buttonRef.current);
    unpinLibrary(library.id);
    const unpinned = t(
      "pinButton.unpinned",
      "{{title}} unpinned from My Libraries.",
      { title: library.title }
    );
    // One announce call, because a second call would replace the first.
    announce(
      wasLast
        ? `${unpinned} ${t("pinButton.nonePinned", "No libraries are pinned.")}`
        : unpinned
    );
    onToggle?.();
  };

  // Some browsers (Firefox and Safari on macOS) do not focus a clicked
  // button, so the dialog is told where to return focus.
  const showDialog = (dialog: typeof warningDialog) => {
    dialog.setDisclosureElement(buttonRef.current);
    dialog.show();
  };

  const handleClick = () => {
    if (pinned) {
      if (hasStoredCredentials(library.slug)) showDialog(unpinDialog);
      else unpin();
    } else if (isPublicWarningHidden()) {
      pin();
    } else {
      showDialog(warningDialog);
    }
  };

  const confirmPin = (hideWarning: boolean) => {
    if (hideWarning) hidePublicWarning();
    pin();
    warningDialog.hide();
  };

  const confirmUnpin = () => {
    // Unpin before signing out, which can navigate away.
    unpin();
    unpinDialog.hide();
    if (signOut) void signOut();
    else clearStoredCredentials(library.slug);
  };

  if (!pinningEnabled) return null;

  // The label names the action, so there is no aria-pressed state as well.
  const label = pinned
    ? t("pinButton.unpin.ariaLabel", "Unpin {{title}} from My Libraries", {
        title: library.title
      })
    : t("pinButton.pin.ariaLabel", "Pin {{title}} to My Libraries", {
        title: library.title
      });

  return (
    <>
      <Button
        ref={buttonRef}
        // Lets a pinned library list find this library's button.
        data-pin-library={library.id}
        variant="ghost"
        color={pinned ? "ui.black" : "ui.gray.dark"}
        className={className}
        onClick={handleClick}
        aria-label={label}
        title={label}
        sx={{ minWidth: 44, minHeight: 44 }}
      >
        <FontAwesomeIcon
          icon={faThumbtack}
          sx={{ transform: pinned ? "none" : "rotate(45deg)" }}
        />
      </Button>
      <PublicComputerWarning dialog={warningDialog} onConfirm={confirmPin} />
      <UnpinConfirmationDialog
        dialog={unpinDialog}
        libraryTitle={library.title}
        onConfirm={confirmUnpin}
      />
    </>
  );
};

export default PinButton;

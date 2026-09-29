import * as React from "react";
import type { DialogStore } from "@ariakit/react/dialog";
import AlertDialog, { AlertDialogActions } from "components/AlertDialog";
import { useTranslation } from "next-i18next/pages";

interface UnpinConfirmationDialogProps {
  dialog: DialogStore;
  libraryTitle: string;
  onConfirm: () => void;
}

/**
 * Confirms unpinning a library the user is signed in to, since unpinning
 * also signs them out.
 */
const UnpinConfirmationDialog: React.FC<UnpinConfirmationDialogProps> = ({
  dialog,
  libraryTitle,
  onConfirm
}) => {
  const { t } = useTranslation();

  return (
    <AlertDialog
      dialog={dialog}
      title={t("unpinConfirmation.title", "Unpin Library")}
      message={t(
        "unpinConfirmation.message",
        "You are signed in to {{title}}. Unpinning will sign you out.",
        { title: libraryTitle }
      )}
    >
      <AlertDialogActions
        onCancel={dialog.hide}
        confirmLabel={t("unpinConfirmation.confirm", "Unpin and Sign Out")}
        confirmColor="ui.error"
        onConfirm={onConfirm}
      />
    </AlertDialog>
  );
};

export default UnpinConfirmationDialog;

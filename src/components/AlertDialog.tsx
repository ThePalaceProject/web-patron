import * as React from "react";
import type { DialogStore } from "@ariakit/react/dialog";
import Modal from "components/Modal";
import Button from "components/Button";
import Stack from "components/Stack";
import { H2 } from "components/Text";
import { useTranslation } from "next-i18next/pages";

interface AlertDialogProps {
  dialog: DialogStore;
  title: string;
  message: React.ReactNode;
  /** Controls below the message, normally `AlertDialogActions`. */
  children: React.ReactNode;
}

/**
 * A confirmation dialog named by its visible title and described by its
 * message, so screen readers read both when it opens. Focus starts on its
 * first control. It closes only through its own controls or Escape, not on
 * an outside click.
 */
const AlertDialog: React.FC<AlertDialogProps> = ({
  dialog,
  title,
  message,
  children
}) => {
  const titleId = React.useId();
  const messageId = React.useId();

  return (
    <Modal
      dialog={dialog}
      role="alertdialog"
      labelledBy={titleId}
      describedBy={messageId}
      showClose={false}
      hideOnClickOutside={false}
      unmountOnHide
    >
      <H2 id={titleId} variant="text.headers.tertiary" sx={{ mt: 0, mb: 2 }}>
        {title}
      </H2>
      <p id={messageId}>{message}</p>
      {children}
    </Modal>
  );
};

interface AlertDialogActionsProps {
  onCancel: () => void;
  confirmLabel: string;
  onConfirm: () => void;
  /** Theme color for the confirm button, e.g. "ui.error" for a destructive action. */
  confirmColor?: string;
}

/** The Cancel and confirm buttons of an `AlertDialog`. */
export const AlertDialogActions: React.FC<AlertDialogActionsProps> = ({
  onCancel,
  confirmLabel,
  onConfirm,
  confirmColor
}) => {
  const { t } = useTranslation();

  return (
    <Stack sx={{ justifyContent: "center" }}>
      <Button variant="ghost" color="ui.gray.dark" onClick={onCancel}>
        {t("actions.cancel", "Cancel", { ns: "common" })}
      </Button>
      <Button color={confirmColor} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </Stack>
  );
};

export default AlertDialog;

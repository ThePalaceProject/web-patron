import * as React from "react";
import type { DialogStore } from "@ariakit/react/dialog";
import AlertDialog, { AlertDialogActions } from "components/AlertDialog";
import { useTranslation } from "next-i18next/pages";

interface PublicComputerWarningProps {
  dialog: DialogStore;
  /** Receives true when the user checked "Do not show this again." */
  onConfirm: (hideWarning: boolean) => void;
}

/**
 * Warns that pinning saves library information in the browser, which is not
 * appropriate on a public or shared computer. Shown before the first pin;
 * the checkbox lets the user suppress it for this browser.
 */
const PublicComputerWarning: React.FC<PublicComputerWarningProps> = ({
  dialog,
  onConfirm
}) => {
  const { t } = useTranslation();

  return (
    <AlertDialog
      dialog={dialog}
      title={t("publicComputerWarning.title", "Pin this library?")}
      message={t(
        "publicComputerWarning.pinMessage",
        "Pinning a library saves it in this browser. Do not pin libraries on a public or shared computer."
      )}
    >
      <WarningControls onCancel={dialog.hide} onConfirm={onConfirm} />
    </AlertDialog>
  );
};

/**
 * The opt-out checkbox and the dialog's buttons. Rendered inside the dialog
 * content, so the checkbox state resets each time the dialog closes.
 */
const WarningControls: React.FC<{
  onCancel: () => void;
  onConfirm: (hideWarning: boolean) => void;
}> = ({ onCancel, onConfirm }) => {
  const { t } = useTranslation();
  const [hideWarning, setHideWarning] = React.useState(false);

  return (
    <>
      <label sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <input
          type="checkbox"
          checked={hideWarning}
          onChange={e => setHideWarning(e.target.checked)}
        />
        {t("publicComputerWarning.dontShowAgain", "Do not show this again.")}
      </label>
      <AlertDialogActions
        onCancel={onCancel}
        confirmLabel={t("publicComputerWarning.confirm", "Pin Library")}
        onConfirm={() => onConfirm(hideWarning)}
      />
    </>
  );
};

export default PublicComputerWarning;

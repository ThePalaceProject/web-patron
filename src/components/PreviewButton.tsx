import * as React from "react";
import Button from "components/Button";
import SvgExternalLink from "icons/ExternalOpen";
import { openPendingTab } from "utils/window";
import { useFulfillmentStackError } from "components/layouts/FulfillmentStack";

const PreviewButton: React.FC<{ previewUrl?: string | null }> = ({
  previewUrl
}) => {
  const { setError } = useFulfillmentStackError();

  function open() {
    setError(null);
    try {
      const tab = openPendingTab();
      tab.navigate(previewUrl as string);
    } catch {
      setError("Error: Could not open preview.");
    }
  }

  if (!previewUrl) return null;

  return (
    <Button
      variant="ghost"
      color="ui.gray.extraDark"
      iconLeft={SvgExternalLink}
      onClick={open}
    >
      Preview
    </Button>
  );
};

export default PreviewButton;

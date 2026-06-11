import * as React from "react";
import Button from "components/Button";
import SvgExternalLink from "icons/ExternalOpen";
import { openPendingTab } from "utils/window";
import { useFulfillmentButtonStackError } from "components/layouts/FulfillmentButtonStack";

const PreviewButton: React.FC<{ previewUrl?: string | null }> = ({
  previewUrl
}) => {
  const { setError } = useFulfillmentButtonStackError();

  function open() {
    setError(null);
    const tab = openPendingTab();
    try {
      tab.navigate(previewUrl as string);
    } catch {
      tab.close();
      setError("Error: Could not open preview.");
    }
  }

  if (!previewUrl) return null;

  return (
    <Button variant="outlined" iconLeft={SvgExternalLink} onClick={open}>
      Preview
    </Button>
  );
};

export default PreviewButton;

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
    try {
      if (!previewUrl) throw Error();
      const tab = openPendingTab();
      tab.navigate(previewUrl);
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

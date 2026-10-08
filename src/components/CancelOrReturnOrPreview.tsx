import * as React from "react";
import FulfillmentButtonStack from "components/layouts/FulfillmentButtonStack";
import CancelOrReturn from "./CancelOrReturn";
import PreviewButton from "./PreviewButton";

const CancelOrReturnOrPreview: React.FC<{
  text: string;
  loadingText: string;
  successMessage: string;
  revokeUrl: string | null;
  id: string;
  previewUrl?: string | null;
}> = ({ text, loadingText, successMessage, revokeUrl, id, previewUrl }) => {
  return (
    <FulfillmentButtonStack>
      <CancelOrReturn
        text={text}
        loadingText={loadingText}
        successMessage={successMessage}
        revokeUrl={revokeUrl}
        id={id}
      />
      <PreviewButton previewUrl={previewUrl} />
    </FulfillmentButtonStack>
  );
};

export default CancelOrReturnOrPreview;

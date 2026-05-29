import * as React from "react";
import FulfillmentStack from "components/layouts/FulfillmentStack";
import CancelOrReturn from "./CancelOrReturn";
import PreviewButton from "./PreviewButton";

const CancelOrReturnOrPreview: React.FC<{
  text: string;
  loadingText: string;
  url: string | null;
  id: string;
  previewUrl?: string | null;
}> = ({ text, loadingText, url, id, previewUrl }) => {
  return (
    <FulfillmentStack>
      <CancelOrReturn text={text} loadingText={loadingText} url={url} id={id} />
      <PreviewButton previewUrl={previewUrl} />
    </FulfillmentStack>
  );
};

export default CancelOrReturnOrPreview;

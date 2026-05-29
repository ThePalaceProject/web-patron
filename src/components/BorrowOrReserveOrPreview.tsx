import * as React from "react";
import FulfillmentStack from "components/layouts/FulfillmentStack";
import BorrowOrReserve from "./BorrowOrReserve";
import PreviewButton from "./PreviewButton";

const BorrowOrReserveOrPreview: React.FC<{
  isBorrow: boolean;
  url: string;
  previewUrl?: string | null;
  className?: string;
}> = ({ isBorrow, url, previewUrl, className }) => (
  <FulfillmentStack className={className}>
    <BorrowOrReserve isBorrow={isBorrow} url={url} />
    <PreviewButton previewUrl={previewUrl} />
  </FulfillmentStack>
);

export default BorrowOrReserveOrPreview;

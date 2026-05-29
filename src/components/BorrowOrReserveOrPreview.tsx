import * as React from "react";
import FulfillmentButtonStack from "components/layouts/FulfillmentButtonStack";
import BorrowOrReserve from "./BorrowOrReserve";
import PreviewButton from "./PreviewButton";

const BorrowOrReserveOrPreview: React.FC<{
  isBorrow: boolean;
  borrowUrl: string;
  previewUrl?: string | null;
  className?: string;
}> = ({ isBorrow, borrowUrl, previewUrl, className }) => (
  <FulfillmentButtonStack className={className}>
    <BorrowOrReserve isBorrow={isBorrow} borrowUrl={borrowUrl} />
    <PreviewButton previewUrl={previewUrl} />
  </FulfillmentButtonStack>
);

export default BorrowOrReserveOrPreview;

import * as React from "react";
import FulfillmentButtonStack from "components/layouts/FulfillmentButtonStack";
import BorrowOrReserve from "./BorrowOrReserve";
import PreviewButton from "./PreviewButton";
import { AvailabilityPlacement } from "utils/book";

const BorrowOrReserveOrPreview: React.FC<{
  isBorrow: boolean;
  borrowUrl: string;
  placement: AvailabilityPlacement;
  previewUrl?: string | null;
  className?: string;
}> = ({ isBorrow, borrowUrl, placement, previewUrl, className }) => (
  <FulfillmentButtonStack className={className}>
    <BorrowOrReserve
      isBorrow={isBorrow}
      borrowUrl={borrowUrl}
      placement={placement}
    />
    <PreviewButton previewUrl={previewUrl} />
  </FulfillmentButtonStack>
);

export default BorrowOrReserveOrPreview;

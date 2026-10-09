import * as React from "react";
import useBorrow from "hooks/useBorrow";
import Button from "./Button";
import { useFulfillmentButtonStackError } from "components/layouts/FulfillmentButtonStack";
import { AvailabilityPlacement } from "utils/book";

const BorrowOrReserve: React.FC<{
  isBorrow: boolean;
  borrowUrl: string;
  placement: AvailabilityPlacement;
}> = ({ isBorrow, borrowUrl, placement }) => {
  const { isLoading, loadingText, buttonLabel, borrowOrReserve, error } =
    useBorrow(isBorrow, placement);
  const { setError } = useFulfillmentButtonStackError();

  React.useEffect(() => {
    setError(error ?? null);
  }, [error, setError]);

  return (
    <Button
      onClick={() => borrowOrReserve(borrowUrl)}
      loading={isLoading}
      loadingText={loadingText}
    >
      {buttonLabel}
    </Button>
  );
};

export default BorrowOrReserve;

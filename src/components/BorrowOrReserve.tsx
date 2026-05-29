import * as React from "react";
import useBorrow from "hooks/useBorrow";
import Button from "./Button";
import { useFulfillmentButtonStackError } from "components/layouts/FulfillmentButtonStack";

const BorrowOrReserve: React.FC<{
  isBorrow: boolean;
  borrowUrl: string;
}> = ({ isBorrow, borrowUrl }) => {
  const { isLoading, loadingText, buttonLabel, borrowOrReserve, error } =
    useBorrow(isBorrow);
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

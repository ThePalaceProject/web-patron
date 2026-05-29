import * as React from "react";
import useBorrow from "hooks/useBorrow";
import Button from "./Button";
import { useFulfillmentStackError } from "components/layouts/FulfillmentStack";

const BorrowOrReserve: React.FC<{
  isBorrow: boolean;
  url: string;
}> = ({ isBorrow, url }) => {
  const { isLoading, loadingText, buttonLabel, borrowOrReserve, error } =
    useBorrow(isBorrow);
  const { setError } = useFulfillmentStackError();

  React.useEffect(() => {
    setError(error ?? null);
  }, [error, setError]);

  return (
    <Button
      onClick={() => borrowOrReserve(url)}
      loading={isLoading}
      loadingText={loadingText}
    >
      {buttonLabel}
    </Button>
  );
};

export default BorrowOrReserve;

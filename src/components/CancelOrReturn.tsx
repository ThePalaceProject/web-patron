import * as React from "react";
import useLibraryContext from "components/context/LibraryContext";
import useUser from "components/context/UserContext";
import { fetchBook } from "dataflow/opds1/fetch";
import Button from "components/Button";
import useError from "hooks/useError";
import { useFulfillmentButtonStackError } from "components/layouts/FulfillmentButtonStack";

const CancelOrReturn: React.FC<{
  text: string;
  loadingText: string;
  revokeUrl: string | null;
  id: string;
}> = ({ text, loadingText, revokeUrl, id }) => {
  const { token, setBook } = useUser();
  const { catalogUrl } = useLibraryContext();
  const [loading, setLoading] = React.useState(false);
  const { error, handleError, setErrorString, clearError } = useError();
  const { setError } = useFulfillmentButtonStackError();

  React.useEffect(() => {
    setError(error ?? null);
  }, [error, setError]);

  async function cancelReservation(revokeUrl: string) {
    clearError();
    if (!token) {
      setErrorString("You must be signed in.");
      return;
    }
    setLoading(true);
    try {
      const newBook = await fetchBook(revokeUrl, catalogUrl, token);
      setBook(newBook, id);
    } catch (e) {
      handleError(e);
    }
    setLoading(false);
  }

  if (!revokeUrl) return null;

  return (
    <Button
      onClick={() => cancelReservation(revokeUrl)}
      loading={loading}
      loadingText={loadingText}
      variant="ghost"
      color="ui.gray.light"
      sx={{
        bg: "ui.gray.light",
        color: "ui.gray.dark",
        "&:hover,&:focus": { color: "ui.gray.dark" }
      }}
    >
      {text}
    </Button>
  );
};

export default CancelOrReturn;

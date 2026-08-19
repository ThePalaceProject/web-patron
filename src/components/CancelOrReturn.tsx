import * as React from "react";
import useLibraryContext from "components/context/LibraryContext";
import useUser from "components/context/UserContext";
import { fetchBook } from "dataflow/catalog";
import Button from "components/Button";
import useError from "hooks/useError";
import { useFulfillmentButtonStackError } from "components/layouts/FulfillmentButtonStack";
import { useTranslation } from "next-i18next/pages";

const CancelOrReturn: React.FC<{
  text: string;
  loadingText: string;
  revokeUrl: string | null;
  id: string;
}> = ({ text, loadingText, revokeUrl, id }) => {
  const { t } = useTranslation("common");
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
      setErrorString(t("auth.mustBeSignedIn", "You must be signed in."));
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
      variant="outlined"
    >
      {text}
    </Button>
  );
};

export default CancelOrReturn;

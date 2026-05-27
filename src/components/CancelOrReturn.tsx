import * as React from "react";
import useLibraryContext from "components/context/LibraryContext";
import useUser from "components/context/UserContext";
import { fetchBook } from "dataflow/opds1/fetch";
import Button from "components/Button";
import { Text } from "components/Text";
import useError from "hooks/useError";
import PreviewButton from "./PreviewButton";
import Stack from "./Stack";

const CancelOrReturn: React.FC<{
  text: string;
  loadingText: string;
  url: string | null;
  id: string;
  previewUrl?: string | null;
}> = ({ text, loadingText, url, id, previewUrl }) => {
  const { token, setBook } = useUser();
  const { catalogUrl } = useLibraryContext();
  const [loading, setLoading] = React.useState(false);
  const { error, handleError, setErrorString, clearError } = useError();

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
  if (!url) return null;
  return (
    <Stack direction="column" sx={{ alignItems: "flex-start" }}>
      <Stack>
        <Button
          onClick={() => cancelReservation(url)}
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
        {previewUrl && <PreviewButton previewUrl={previewUrl} />}
      </Stack>
      {error && <Text>{error}</Text>}
    </Stack>
  );
};

export default CancelOrReturn;

import * as React from "react";
import { DownloadDetails } from "utils/fulfill";
import useUser from "components/context/UserContext";
import downloadFile from "dataflow/download";
import { ServerError } from "errors";

export default function useDownloadButton(
  details: DownloadDetails,
  title: string
) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { token } = useUser();

  async function download() {
    setLoading(true);
    setError(null);
    try {
      await downloadFile(details.url, title, details.mediaType, token);
    } catch (e) {
      setLoading(false);
      if (e instanceof ServerError) {
        setError(`Error: ${e.info.detail}`);
        return;
      }
      console.error(e);
      setError(`Error: An unknown error occurred while downloading the file.`);
    }
    setLoading(false);
  }

  return {
    download,
    error,
    loading
  };
}

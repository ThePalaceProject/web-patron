import track from "analytics/track";
import { ServerError } from "errors";
import { useTranslation } from "next-i18next/pages";
import * as React from "react";

/**
 * Parses error objects, keeps them in state and tracks them
 */
export default function useError() {
  const { t } = useTranslation("common");
  const [error, setError] = React.useState<null | string>(null);

  // for network errors
  function handleError(e: any) {
    track.error(e);
    if (e instanceof ServerError) {
      setError(
        t("error.errorWithDescription", "Error: {{description}}", {
          description: e.info.detail
        })
      );
      return;
    }
    setError(t("error.unknown", "Error: An unknown error occurred."));
  }

  // for internal error states we don't need to track
  function setErrorString(str: string) {
    setError(
      t("error.errorWithDescription", "Error: {{description}}", {
        description: str
      })
    );
  }

  function clearError() {
    setError(null);
  }

  return {
    error,
    handleError,
    setErrorString,
    clearError
  };
}

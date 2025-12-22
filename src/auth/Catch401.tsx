import * as React from "react";
import { Key, SWRConfig } from "swr";
import swrConfig from "utils/swrConfig";
import { ServerError } from "errors";
import track from "analytics/track";
import useLogin from "auth/useLogin";
import useUser from "components/context/UserContext";

interface Props {
  children: React.ReactNode;
}

const CatchFetchErrors = ({ children }: Props) => {
  const { initLogin } = useLogin();
  const { isLoading, authFailureContext } = useUser();

  function handle401() {
    // Handle redirect-based auth failures generically
    if (authFailureContext) {
      const serverErrorMessage = formatAuthError(authFailureContext.error);

      initLogin(
        undefined,
        serverErrorMessage,
        !authFailureContext.preventRetryToCurrentPage
      );
      return;
    }

    // Legacy: if a clever error is detected in URL hash, use that
    // TODO: Migrate Clever to use authFailureContext in future
    const cleverError = extractCleverError();
    if (cleverError) {
      initLogin(undefined, cleverError);
    } else {
      if (!isLoading) initLogin();
    }
  }

  const config = {
    ...swrConfig,
    onError: (error: Error, _key: Key) => {
      if (error instanceof ServerError) {
        if (error.info.status === 401) {
          handle401();
          return;
        }
      }
      // track the error to bugsnag
      track.error(error);
    }
  };

  return <SWRConfig value={config}>{children}</SWRConfig>;
};

export default CatchFetchErrors;

/**
 * Formats a ServerError into a user-friendly message.
 * Extracts title and detail from the OPDS Problem Document.
 */
function formatAuthError(error: ServerError): string {
  if (error?.info?.title && error?.info?.detail) {
    return `${error.info.title}: ${error.info.detail}`;
  }

  return "Authentication completed successfully, but your account was not recognized. Please contact your library for assistance.";
}

/**
 * Attempts to find an error in the url hash that was set by
 * Clever.
 */
function extractCleverError(): string | undefined {
  const parsedHash = new URLSearchParams(
    window.location.hash.substr(1) // skip the first char (#)
  );
  const errObj = parsedHash.get("error");
  if (errObj) return JSON.parse(errObj).detail;
}

/** @jsxRuntime classic */
/** @jsx jsx */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { jsx } from "theme-ui";
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
  const { isLoading } = useUser();

  function handle401() {
    // if a clever error is detected, we set that in the url
    // while redirecting
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

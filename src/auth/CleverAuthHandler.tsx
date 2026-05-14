import * as React from "react";
import { OPDS1 } from "interfaces";
import LoadingIndicator from "components/LoadingIndicator";
import Stack from "components/Stack";
import useUser from "components/context/UserContext";
import { clientOnly } from "components/ClientOnly";
import useLoginRedirectUrl from "auth/useLoginRedirect";
import ApplicationError from "errors";
import Button from "components/Button";
import { Text } from "components/Text";

// Two sessionStorage flags track redirect state across hard page navigations.
// CLEVER_REDIRECT_FLAG: set before leaving for Clever.
// CLEVER_CANCEL_FLAG: set when the user returns without completing auth.
// When only the redirect flag is set, we show cancel UI and set the cancel flag.
// When both are set, the user is intentionally navigating back to sign in,
// so we clear both and proceed with a new redirect.
const CLEVER_REDIRECT_FLAG = "cpw-clever-redirect";
const CLEVER_CANCEL_FLAG = "cpw-clever-cancelled";

const CleverAuthHandler: React.FC<{ method: OPDS1.CleverAuthMethod }> = ({
  method
}) => {
  const { token } = useUser();
  const { fullSuccessUrl } = useLoginRedirectUrl();

  const authenticateHref = method.links?.find(
    link => link.rel === "authenticate"
  )?.href;

  // double encoding is required for unshortened book urls to be redirected to properly
  const authUrl = authenticateHref
    ? `${authenticateHref}&redirect_uri=${encodeURIComponent(
        encodeURIComponent(fullSuccessUrl)
      )}`
    : undefined;

  const [cancelDetected, setCancelDetected] = React.useState(false);

  React.useEffect(() => {
    if (token) {
      sessionStorage.removeItem(CLEVER_REDIRECT_FLAG);
      sessionStorage.removeItem(CLEVER_CANCEL_FLAG);
      return;
    }
    if (!authUrl) {
      throw new ApplicationError({
        title: "Incomplete Library Data",
        detail:
          "The required link with rel 'authenticate' is missing from library data."
      });
    }

    const hasRedirectFlag = !!sessionStorage.getItem(CLEVER_REDIRECT_FLAG);
    const hasCancelFlag = !!sessionStorage.getItem(CLEVER_CANCEL_FLAG);

    if (hasRedirectFlag && !hasCancelFlag) {
      // First return from Clever without completing auth.
      sessionStorage.setItem(CLEVER_CANCEL_FLAG, "1");
      setCancelDetected(true);
      return;
    }

    if (hasRedirectFlag && hasCancelFlag && !cancelDetected) {
      // User already saw the cancel screen and is intentionally navigating
      // back to sign in (e.g. clicked Sign In in the header). Clear both
      // flags and fall through to redirect.
      sessionStorage.removeItem(CLEVER_REDIRECT_FLAG);
      sessionStorage.removeItem(CLEVER_CANCEL_FLAG);
    }

    if (!cancelDetected) {
      sessionStorage.setItem(CLEVER_REDIRECT_FLAG, "1");
      window.location.href = authUrl;
      // Cleanup runs on normal React unmount (e.g. client-side nav away).
      // Hard navigation via window.location.href bypasses this, so the flag
      // persists for the browser-back case.
      return () => {
        sessionStorage.removeItem(CLEVER_REDIRECT_FLAG);
      };
    }
  }, [token, authUrl, cancelDetected]);

  if (cancelDetected) {
    return (
      <Stack
        direction="column"
        sx={{
          alignItems: "center",
          gap: 3,
          maxWidth: 500,
          margin: "0 auto",
          textAlign: "center"
        }}
      >
        <Text sx={{ fontSize: 2 }}>Login was cancelled.</Text>
        <Button
          onClick={() => {
            sessionStorage.removeItem(CLEVER_REDIRECT_FLAG);
            sessionStorage.removeItem(CLEVER_CANCEL_FLAG);
            setCancelDetected(false);
          }}
        >
          Try Again
        </Button>
      </Stack>
    );
  }

  return (
    <Stack direction="column" sx={{ alignItems: "center" }}>
      <LoadingIndicator />
      Logging in with Clever...
    </Stack>
  );
};

export default clientOnly(CleverAuthHandler);

import * as React from "react";
import { useRouter } from "next/router";
import { ClientOidcMethod } from "interfaces";
import LoadingIndicator from "components/LoadingIndicator";
import Stack from "components/Stack";
import useUser from "components/context/UserContext";
import useLoginRedirectUrl from "auth/useLoginRedirect";
import { clientOnly } from "components/ClientOnly";
import extractParam from "dataflow/utils";
import Button from "components/Button";
import { Text } from "components/Text";

/**
 * The OIDC Auth handler sends you off to an external website to complete
 * auth.
 */
const OidcAuthHandler: React.FC<{ method: ClientOidcMethod }> = ({
  method
}) => {
  const { token } = useUser();
  const { fullSuccessUrl } = useLoginRedirectUrl();
  const router = useRouter();

  // Extract login error from query params, if present.
  const loginError = extractParam(router.query, "loginError");

  const urlWithRedirect = `${method.href}&redirect_uri=${encodeURIComponent(
    fullSuccessUrl
  )}`;

  // Two sessionStorage flags track redirect state across hard page navigations.
  // redirectFlagKey: set before leaving for the OIDC provider.
  // cancelFlagKey: set when the user returns without completing auth.
  // When only the redirect flag is set, we show cancel UI and set the cancel flag.
  // When both are set, the user is intentionally navigating back to sign in,
  // so we clear both and proceed with a new redirect.
  const redirectFlagKey = `cpw-oidc-redirect-${method.id}`;
  const cancelFlagKey = `cpw-oidc-cancelled-${method.id}`;
  const [cancelDetected, setCancelDetected] = React.useState(false);

  React.useEffect(() => {
    if (token) {
      sessionStorage.removeItem(redirectFlagKey);
      sessionStorage.removeItem(cancelFlagKey);
      return;
    }

    const hasRedirectFlag = !!sessionStorage.getItem(redirectFlagKey);
    const hasCancelFlag = !!sessionStorage.getItem(cancelFlagKey);

    if (hasRedirectFlag && !hasCancelFlag && !loginError) {
      // First return from OIDC provider without completing auth.
      sessionStorage.setItem(cancelFlagKey, "1");
      setCancelDetected(true);
      return;
    }

    if (hasRedirectFlag && hasCancelFlag && !cancelDetected) {
      // User already saw the cancel screen and is intentionally navigating
      // back to sign in (e.g. clicked Sign In in the header). Clear both
      // flags and fall through to redirect.
      sessionStorage.removeItem(redirectFlagKey);
      sessionStorage.removeItem(cancelFlagKey);
    }

    if (urlWithRedirect && !loginError && !cancelDetected) {
      sessionStorage.setItem(redirectFlagKey, "1");
      window.location.href = urlWithRedirect;
      // Cleanup runs on normal React unmount (e.g. client-side nav away).
      // Hard navigation via window.location.href bypasses this, so the flag
      // persists for the browser-back case.
      return () => {
        sessionStorage.removeItem(redirectFlagKey);
      };
    }
  }, [
    token,
    urlWithRedirect,
    loginError,
    cancelDetected,
    redirectFlagKey,
    cancelFlagKey
  ]);

  const handleTryAgain = () => {
    sessionStorage.removeItem(redirectFlagKey);
    sessionStorage.removeItem(cancelFlagKey);
    setCancelDetected(false);
    if (loginError) {
      const { loginError: _, ...restQuery } = router.query;
      router.replace(
        { pathname: router.pathname, query: restQuery },
        undefined,
        { shallow: true }
      );
    }
  };

  // Display error if present
  if (loginError) {
    return (
      <Stack
        direction="column"
        sx={{
          alignItems: "center",
          gap: 3,
          maxWidth: 500,
          margin: "0 auto",
          textAlign: "center",
          textWrap: "balance"
        }}
      >
        <Text sx={{ color: "ui.error", fontSize: 2 }}>{loginError}</Text>
        <Button onClick={handleTryAgain}>Try Again</Button>
      </Stack>
    );
  }

  // Display cancel UI if the user returned without completing auth.
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
        <Button onClick={handleTryAgain}>Try Again</Button>
      </Stack>
    );
  }

  // Show loading state while redirecting
  return (
    <Stack direction="column" sx={{ alignItems: "center" }}>
      <LoadingIndicator />
      Logging in with {method.description}...
    </Stack>
  );
};

export default clientOnly(OidcAuthHandler);

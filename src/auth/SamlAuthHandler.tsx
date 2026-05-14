import * as React from "react";
import { useRouter } from "next/router";
import { ClientSamlMethod } from "interfaces";
import LoadingIndicator from "components/LoadingIndicator";
import Stack from "components/Stack";
import useUser from "components/context/UserContext";
import useLoginRedirectUrl from "auth/useLoginRedirect";
import { clientOnly } from "components/ClientOnly";
import extractParam from "dataflow/utils";
import Button from "components/Button";
import { Text } from "components/Text";

/**
 * The SAML Auth handler sends you off to an external website to complete
 * auth.
 */
const SamlAuthHandler: React.FC<{ method: ClientSamlMethod }> = ({
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
  // redirectFlagKey: set before leaving for the SAML IdP.
  // cancelFlagKey: set when the user returns without completing auth.
  // When only the redirect flag is set, we show cancel UI and set the cancel flag.
  // When both are set, the user is intentionally navigating back to sign in,
  // so we clear both and proceed with a new redirect.
  const redirectFlagKey = `cpw-saml-redirect-${method.id}`;
  const cancelFlagKey = `cpw-saml-cancelled-${method.id}`;
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
      // First return from SAML IdP without completing auth.
      sessionStorage.removeItem(redirectFlagKey);
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

      /*
       * Safari restores pages from bfcache on browser-back without re-running
       * React effects. Listen for pageshow so we can detect this case and show
       * cancel UI instead of leaving the spinner running indefinitely.
       */
      const handlePageShow = (event: PageTransitionEvent) => {
        if (
          event.persisted &&
          !!sessionStorage.getItem(redirectFlagKey) &&
          !sessionStorage.getItem(cancelFlagKey)
        ) {
          sessionStorage.removeItem(redirectFlagKey);
          sessionStorage.setItem(cancelFlagKey, "1");
          setCancelDetected(true);
        }
      };
      window.addEventListener("pageshow", handlePageShow);

      window.location.href = urlWithRedirect;

      return () => {
        sessionStorage.removeItem(redirectFlagKey);
        window.removeEventListener("pageshow", handlePageShow);
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

  const handleCancel = () => {
    sessionStorage.removeItem(redirectFlagKey);
    sessionStorage.removeItem(cancelFlagKey);
    setCancelDetected(true);
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
    <Stack direction="column" sx={{ alignItems: "center", gap: 3 }}>
      <Stack direction="column" sx={{ alignItems: "center" }}>
        <LoadingIndicator />
        Logging in with {method.description}...
      </Stack>
      <Button onClick={handleCancel}>Cancel</Button>
    </Stack>
  );
};

export default clientOnly(SamlAuthHandler);

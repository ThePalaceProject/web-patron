import * as React from "react";
import { useRouter } from "next/router";

/*
 * Two sessionStorage flags track redirect state across hard page navigations.
 * redirectFlagKey: set before leaving for the external provider.
 * cancelFlagKey: set when the user returns without completing auth.
 * When only the redirect flag is set, we show cancel UI and set the cancel flag.
 * When both are set, the user is intentionally navigating back to sign in,
 * so we clear both and proceed with a new redirect.
 */
export function useRedirectCancelDetection({
  authUrl,
  redirectFlagKey,
  cancelFlagKey,
  loginError,
  token
}: {
  authUrl: string | undefined;
  redirectFlagKey: string;
  cancelFlagKey: string;
  loginError: string | undefined;
  token: string | undefined;
}): {
  cancelDetected: boolean;
  handleTryAgain: () => void;
  handleCancel: () => void;
} {
  const router = useRouter();
  const [cancelDetected, setCancelDetected] = React.useState(
    () =>
      !sessionStorage.getItem(redirectFlagKey) &&
      !!sessionStorage.getItem(cancelFlagKey)
  );

  React.useEffect(() => {
    if (token) {
      sessionStorage.removeItem(redirectFlagKey);
      sessionStorage.removeItem(cancelFlagKey);
      return;
    }

    const hasRedirectFlag = !!sessionStorage.getItem(redirectFlagKey);
    const hasCancelFlag = !!sessionStorage.getItem(cancelFlagKey);

    if (hasRedirectFlag && !hasCancelFlag && !loginError) {
      // First return from the provider without completing auth.
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

    if (authUrl && !loginError && !cancelDetected) {
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

      window.location.href = authUrl;

      return () => {
        window.removeEventListener("pageshow", handlePageShow);
      };
    }
  }, [
    token,
    authUrl,
    loginError,
    cancelDetected,
    redirectFlagKey,
    cancelFlagKey
  ]);

  const handleTryAgain = React.useCallback(() => {
    sessionStorage.removeItem(redirectFlagKey);
    sessionStorage.removeItem(cancelFlagKey);
    setCancelDetected(false);
    if (loginError) {
      // The URL still contains loginError until the router replace resolves.
      // The effect's !loginError guard prevents an immediate redirect in the
      // interim re-render while the navigation is in flight.
      const { loginError: _, ...restQuery } = router.query;
      router.replace(
        { pathname: router.pathname, query: restQuery },
        undefined,
        { shallow: true }
      );
    }
  }, [redirectFlagKey, cancelFlagKey, loginError, router]);

  const handleCancel = React.useCallback(() => {
    sessionStorage.removeItem(redirectFlagKey);
    sessionStorage.removeItem(cancelFlagKey);
    setCancelDetected(true);
  }, [redirectFlagKey, cancelFlagKey]);

  return { cancelDetected, handleTryAgain, handleCancel };
}

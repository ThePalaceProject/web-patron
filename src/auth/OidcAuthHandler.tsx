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
  const { token, signOut } = useUser();
  const { fullSuccessUrl } = useLoginRedirectUrl();
  const router = useRouter();

  // Extract login error from query params, if present.
  const loginError = extractParam(router.query, "loginError");

  const urlWithRedirect = `${method.href}&redirect_uri=${encodeURIComponent(
    fullSuccessUrl
  )}`;

  React.useEffect(() => {
    // Redirect to OIDC provider if not already signed in and no current error.
    if (!token && urlWithRedirect && !loginError) {
      window.location.href = urlWithRedirect;
    }
  }, [token, signOut, urlWithRedirect, loginError]);

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
        <Button
          onClick={() => {
            // Clear error and retry by removing loginError from URL
            const { loginError: _, ...restQuery } = router.query;
            router.replace(
              { pathname: router.pathname, query: restQuery },
              undefined,
              { shallow: true }
            );
          }}
        >
          Try Again
        </Button>
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

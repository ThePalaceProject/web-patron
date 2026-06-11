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
import { useRedirectCancelDetection } from "auth/useRedirectCancelDetection";
import { AuthFeedbackPanel } from "auth/AuthFeedbackPanel";

export const oidcRedirectFlag = (id: string) => `cpw-oidc-redirect-${id}`;
export const oidcCancelFlag = (id: string) => `cpw-oidc-cancelled-${id}`;

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
  const loginError = extractParam(router.query, "loginError");

  const authUrl = appendSearchParam(
    method.href,
    "redirect_uri",
    fullSuccessUrl
  );
  const altAuthUrl = appendSearchParam(authUrl, "prompt", "select_account");

  const { cancelDetected, handleTryAgain, handleCancel } =
    useRedirectCancelDetection({
      authUrl,
      redirectFlagKey: oidcRedirectFlag(method.id),
      cancelFlagKey: oidcCancelFlag(method.id),
      loginError,
      token
    });

  const handleSwitchAccount = React.useCallback(() => {
    sessionStorage.removeItem(oidcRedirectFlag(method.id));
    sessionStorage.removeItem(oidcCancelFlag(method.id));
    window.location.href = altAuthUrl;
  }, [altAuthUrl, method.id]);

  const switchAccountAction = React.useMemo(
    () => ({ label: "Use a different account", onClick: handleSwitchAccount }),
    [handleSwitchAccount]
  );

  if (loginError) {
    return (
      <AuthFeedbackPanel
        message={loginError}
        isError
        onTryAgain={handleTryAgain}
        secondaryAction={switchAccountAction}
      />
    );
  }
  if (cancelDetected) {
    return (
      <AuthFeedbackPanel
        message="Login was cancelled."
        onTryAgain={handleTryAgain}
        secondaryAction={switchAccountAction}
      />
    );
  }
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

function appendSearchParam(href: string, name: string, value: string): string {
  const url = new URL(href);
  url.searchParams.set(name, value);
  return url.toString();
}

export default clientOnly(OidcAuthHandler);

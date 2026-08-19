import * as React from "react";
import { useRouter } from "next/router";
import { ClientOidcMethod, ClientSamlMethod } from "interfaces";
import LoadingIndicator from "components/LoadingIndicator";
import Stack from "components/Stack";
import useUser from "components/context/UserContext";
import useLoginRedirectUrl from "auth/useLoginRedirect";
import extractParam from "dataflow/utils";
import Button from "components/Button";
import { useRedirectCancelDetection } from "auth/useRedirectCancelDetection";
import { AuthFeedbackPanel } from "auth/AuthFeedbackPanel";
import { appendSearchParam } from "utils/url";
import { useTranslation } from "next-i18next/pages";

/**
 * Shared handler for auth methods (SAML, OIDC) that send the user to an
 * external provider to complete auth. When login fails or is cancelled, the
 * user can retry or switch accounts; switchAccountParam is the query
 * parameter that asks the provider for a fresh account choice.
 */
export const RedirectAuthHandler: React.FC<{
  method: ClientSamlMethod | ClientOidcMethod;
  redirectFlagKey: string;
  cancelFlagKey: string;
  switchAccountParam: { name: string; value: string };
}> = ({ method, redirectFlagKey, cancelFlagKey, switchAccountParam }) => {
  const { t } = useTranslation();
  const { token } = useUser();
  const { fullSuccessUrl } = useLoginRedirectUrl();
  const router = useRouter();
  const loginError = extractParam(router.query, "loginError");

  const authUrl = appendSearchParam(
    method.href,
    "redirect_uri",
    fullSuccessUrl
  );
  const altAuthUrl = appendSearchParam(
    authUrl,
    switchAccountParam.name,
    switchAccountParam.value
  );

  const { cancelDetected, handleTryAgain, handleCancel } =
    useRedirectCancelDetection({
      authUrl,
      redirectFlagKey,
      cancelFlagKey,
      loginError,
      token
    });

  const handleSwitchAccount = React.useCallback(() => {
    // Set the redirect flag before leaving so a return without completing
    // auth is detected as a cancel.
    sessionStorage.setItem(redirectFlagKey, "1");
    sessionStorage.removeItem(cancelFlagKey);
    window.location.href = altAuthUrl;
  }, [altAuthUrl, redirectFlagKey, cancelFlagKey]);

  const switchAccountAction = React.useMemo(
    () => ({
      label: t(
        "redirectAuthHandler.useDifferentAccount",
        "Use a different account"
      ),
      onClick: handleSwitchAccount
    }),
    [handleSwitchAccount, t]
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
        message={t("auth.loginCancelled", "Login was cancelled.", {
          ns: "common"
        })}
        onTryAgain={handleTryAgain}
        secondaryAction={switchAccountAction}
      />
    );
  }
  return (
    <Stack direction="column" sx={{ alignItems: "center", gap: 3 }}>
      <Stack direction="column" sx={{ alignItems: "center" }}>
        <LoadingIndicator />
        {t("auth.loggingInWithMethod", "Logging in with {{authMethod}}...", {
          authMethod: method.description,
          ns: "common"
        })}
      </Stack>
      <Button onClick={handleCancel}>
        {t("actions.cancel", "Cancel", { ns: "common" })}
      </Button>
    </Stack>
  );
};

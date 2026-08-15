import * as React from "react";
import { useRouter } from "next/router";
import { ClientCleverMethod } from "interfaces";
import LoadingIndicator from "components/LoadingIndicator";
import Stack from "components/Stack";
import useUser from "components/context/UserContext";
import { clientOnly } from "components/ClientOnly";
import useLoginRedirectUrl from "auth/useLoginRedirect";
import ApplicationError from "errors";
import Button from "components/Button";
import extractParam from "dataflow/utils";
import { useRedirectCancelDetection } from "auth/useRedirectCancelDetection";
import { AuthFeedbackPanel } from "auth/AuthFeedbackPanel";
import { useTranslation } from "next-i18next/pages";

export const cleverRedirectFlag = (id: string) => `cpw-clever-redirect-${id}`;
export const cleverCancelFlag = (id: string) => `cpw-clever-cancelled-${id}`;

const CleverAuthHandler: React.FC<{ method: ClientCleverMethod }> = ({
  method
}) => {
  const { t } = useTranslation();
  const { token } = useUser();
  const { fullSuccessUrl } = useLoginRedirectUrl();
  const router = useRouter();
  const loginError = extractParam(router.query, "loginError");

  const authenticateHref = method.links?.find(
    link => link.rel === "authenticate"
  )?.href;

  // double encoding is required for unshortened book urls to be redirected to properly
  const authUrl = authenticateHref
    ? `${authenticateHref}&redirect_uri=${encodeURIComponent(
        encodeURIComponent(fullSuccessUrl)
      )}`
    : undefined;

  const { cancelDetected, handleTryAgain, handleCancel } =
    useRedirectCancelDetection({
      authUrl,
      redirectFlagKey: cleverRedirectFlag(method.id),
      cancelFlagKey: cleverCancelFlag(method.id),
      loginError,
      token
    });

  React.useEffect(() => {
    if (!token && !authUrl) {
      throw new ApplicationError({
        title: "Incomplete Library Data",
        detail:
          "The required link with rel 'authenticate' is missing from library data."
      });
    }
  }, [token, authUrl]);

  if (loginError) {
    return (
      <AuthFeedbackPanel
        message={loginError}
        isError
        onTryAgain={handleTryAgain}
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
      />
    );
  }
  return (
    <Stack direction="column" sx={{ alignItems: "center", gap: 3 }}>
      <Stack direction="column" sx={{ alignItems: "center" }}>
        <LoadingIndicator />
        {t("auth.loggingInWithMethod", "Logging in with {{authMethod}}...", {
          authMethod: "Clever",
          ns: "common"
        })}
      </Stack>
      <Button onClick={handleCancel}>
        {t("actions.cancel", "Cancel", { ns: "common" })}
      </Button>
    </Stack>
  );
};

export default clientOnly(CleverAuthHandler);

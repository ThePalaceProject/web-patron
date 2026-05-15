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
import { useRedirectCancelDetection } from "auth/useRedirectCancelDetection";
import { AuthFeedbackPanel } from "auth/AuthFeedbackPanel";

export const samlRedirectFlag = (id: string) => `cpw-saml-redirect-${id}`;
export const samlCancelFlag = (id: string) => `cpw-saml-cancelled-${id}`;

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
  const loginError = extractParam(router.query, "loginError");

  const authUrl = `${method.href}&redirect_uri=${encodeURIComponent(fullSuccessUrl)}`;

  const { cancelDetected, handleTryAgain, handleCancel } =
    useRedirectCancelDetection({
      authUrl,
      redirectFlagKey: samlRedirectFlag(method.id),
      cancelFlagKey: samlCancelFlag(method.id),
      loginError,
      token
    });

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
        message="Login was cancelled."
        onTryAgain={handleTryAgain}
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

export default clientOnly(SamlAuthHandler);

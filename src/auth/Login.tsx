import * as React from "react";
import useLibraryContext from "components/context/LibraryContext";
import ExternalLink from "components/ExternalLink";
import { Text } from "components/Text";
import LoadingIndicator from "components/LoadingIndicator";
import useLogin from "auth/useLogin";
import { isSupportedAuthType } from "./AuthenticationHandler";
import { Trans, useTranslation } from "next-i18next/pages";

export default function Login(): React.ReactElement {
  const { initLogin } = useLogin();

  // AppAuthMethod[] shouldn't be populated with unsupported auth methods from auth document,
  // but we filter out any unsupported methods just in case.
  const { authMethods } = useLibraryContext();
  const supportedAuthMethods = authMethods.filter(m =>
    isSupportedAuthType(m.type)
  );

  // Automatically redirect user to first supported auth method
  React.useEffect(() => {
    if (supportedAuthMethods.length > 0) {
      initLogin(supportedAuthMethods[0].id);
    }
  }, [supportedAuthMethods, initLogin]);

  if (supportedAuthMethods.length === 0) {
    return <NoAuth />;
  }

  // we are about to be redirected, show a temp loader
  return <LoadingIndicator />;
}

const NoAuth: React.FC = () => {
  const { t } = useTranslation();
  const {
    libraryLinks: { helpEmail }
  } = useLibraryContext();
  return (
    <div sx={{ display: "flex", justifyContent: "center", maxWidth: 500 }}>
      <Text>
        <Trans i18nKey="login.noAuth">
          This Library does not have any authentication configured.{" "}
          {helpEmail && (
            <Text>
              If this is an error, please contact your site administrator via
              email at:{" "}
              <ExternalLink
                role="link"
                href={helpEmail.href}
                aria-label={t(
                  "login.helpEmail.ariaLabel",
                  "Send email to help desk"
                )}
              >
                {helpEmail.href.replace("mailto:", "")}
              </ExternalLink>
              .
            </Text>
          )}
        </Trans>
      </Text>
    </div>
  );
};

/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useLibraryContext from "components/context/LibraryContext";
import ExternalLink from "components/ExternalLink";
import { Text } from "components/Text";
import LoadingIndicator from "components/LoadingIndicator";
import useLogin from "auth/useLogin";
import { isSupportedAuthType } from "./AuthenticationHandler";

export default function LoginPicker(): React.ReactElement {
  const { initLogin } = useLogin();

  // Here we filter out any methods from the auth document that we don't support.
  // We're aliasing the `authMethods` variable here so that we can end up with
  // the same variable name after filtering.
  const { authMethods: methodsFromAuthDocument } = useLibraryContext();
  const authMethods = methodsFromAuthDocument.filter(m =>
    isSupportedAuthType(m.type)
  );

  // Redirect user automatically to appropriate method if there is
  // only one auth method
  React.useEffect(() => {
    if (authMethods.length > 0) {
      initLogin(authMethods[0].id);
    }
  }, [authMethods, initLogin]);

  if (authMethods.length === 0) {
    return <NoAuth />;
  }

  // we are about to be redirected, show a temp loader
  return <LoadingIndicator />;
}

const NoAuth: React.FC = () => {
  const {
    libraryLinks: { helpEmail }
  } = useLibraryContext();
  return (
    <div sx={{ display: "flex", justifyContent: "center", maxWidth: 500 }}>
      <Text>
        This Library does not have any authentication configured.{" "}
        {helpEmail && (
          <Text>
            If this is an error, please contact your site administrator via
            email at:{" "}
            <ExternalLink
              role="link"
              href={helpEmail.href}
              aria-label="Send email to help desk"
            >
              {helpEmail.href.replace("mailto:", "")}
            </ExternalLink>
            .
          </Text>
        )}
      </Text>
    </div>
  );
};

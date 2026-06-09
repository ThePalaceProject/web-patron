import * as React from "react";
import useLibraryContext from "components/context/LibraryContext";
import ExternalLink from "components/ExternalLink";

const ForgotPasswordLink: React.FC = () => {
  const {
    libraryLinks: { resetPassword }
  } = useLibraryContext();

  if (!resetPassword?.href) return null;

  return (
    <ExternalLink href={resetPassword.href} target="_blank">
      Forgot your password?
    </ExternalLink>
  );
};

export default ForgotPasswordLink;

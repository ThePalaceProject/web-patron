import * as React from "react";
import useLibraryContext from "components/context/LibraryContext";
import ExternalLink from "components/ExternalLink";
import { useTranslation } from "next-i18next/pages";

const ForgotPasswordLink: React.FC = () => {
  const { t } = useTranslation();
  const {
    libraryLinks: { resetPassword }
  } = useLibraryContext();

  if (!resetPassword?.href) return null;

  return (
    <ExternalLink href={resetPassword.href}>
      {t("forgotPasswordLink.forgotPassword", "Forgot your password?")}
    </ExternalLink>
  );
};

export default ForgotPasswordLink;

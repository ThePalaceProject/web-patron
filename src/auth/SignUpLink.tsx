import * as React from "react";
import useLibraryContext from "components/context/LibraryContext";
import ExternalLink from "components/ExternalLink";
import { useTranslation } from "next-i18next/pages";

const SignUpLink: React.FC = () => {
  const { t } = useTranslation();
  const {
    libraryLinks: { registration }
  } = useLibraryContext();

  if (!registration?.href) return null;

  return (
    <div sx={{ textAlign: "center" }}>
      <ExternalLink href={registration.href}>
        {t("signUpLink.signUp", "Sign up for a library card")}
      </ExternalLink>
    </div>
  );
};

export default SignUpLink;

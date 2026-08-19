import React from "react";
import { NavButton } from "components/Button";
import { AppAuthMethod } from "interfaces";
import useLogin from "auth/useLogin";
import { useTranslation } from "next-i18next/pages";

export const authButtonstyles = {
  display: "flex",
  flex: "1 0 auto",
  width: "280px",
  height: "51px",
  backgroundSize: `280px 51px`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "0",
  cursor: "pointer",
  border: "none"
};

const AuthButton: React.FC<{
  method: AppAuthMethod;
  className?: string;
}> = ({ method, className }) => {
  const { t } = useTranslation();
  const { description, links } = method;
  const imageUrl = links?.find(link => link.rel === "logo")?.href;
  const name = description ?? "Basic Auth";
  const { getLoginUrl } = useLogin();
  const loginUrl = getLoginUrl(method.id);

  const label = t("authButton.loginWithMethod", "Login with {{name}}", {
    name
  });

  return (
    <NavButton
      aria-label={label}
      type="submit"
      className={className}
      sx={{
        ...authButtonstyles,
        backgroundImage: `url(${imageUrl})`
      }}
      href={loginUrl}
    >
      {imageUrl ? "" : label}
    </NavButton>
  );
};

export default AuthButton;

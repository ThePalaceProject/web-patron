import * as React from "react";
import { useForm } from "react-hook-form";
import { Text } from "components/Text";
import Button, { InputIconButton } from "components/Button";
import FormInput from "components/form/FormInput";
import { modalButtonStyles } from "components/Modal";
import { ClientBasicMethod } from "interfaces";
import { generateToken } from "auth/useCredentials";
import ForgotPasswordLink from "auth/ForgotPasswordLink";
import { authFormStyles } from "auth/styles";
import useUser from "components/context/UserContext";
import { ServerError } from "errors";
import { Keyboard } from "types/opds1";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "next-i18next/pages";

type FormData = {
  [key: string]: string;
};

/**
 * Renders a form for completing basic auth.
 */
const BasicAuthHandler: React.FC<{
  method: ClientBasicMethod;
}> = ({ method }) => {
  const { t } = useTranslation();
  const { signIn, error, isLoading } = useUser();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>();

  const usernameInputName = method.labels.login;
  const passwordInputName = method.labels.password;

  const onSubmit = handleSubmit(async values => {
    const login = values[usernameInputName];
    const password = values[passwordInputName];
    // try to login with these credentials
    const token = generateToken(login, password);
    signIn(token, method);
  });

  const serverError = error instanceof ServerError ? error : undefined;

  const hasPasswordInput =
    method.inputs?.password?.keyboard !== Keyboard.NoInput;

  const [showPassword, setShowPassword] = React.useState(false);
  const togglePasswordVisibility = _event => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={onSubmit} sx={authFormStyles}>
      <Text sx={{ color: "ui.error", alignItems: "center", display: "flex" }}>
        {serverError && `${serverError.info.title}: ${serverError.info.detail}`}
      </Text>
      <FormInput
        label={usernameInputName}
        placeholder={usernameInputName}
        {...register(usernameInputName, {
          required: true,
          maxLength: 25
        })}
        error={
          errors[usernameInputName] &&
          t("auth.fieldRequired", "Your {{field}} is required.", {
            field: usernameInputName,
            ns: "common"
          })
        }
      />
      {hasPasswordInput && (
        <FormInput
          label={passwordInputName}
          {...register(passwordInputName, {
            required: true,
            maxLength: 25
          })}
          type={showPassword ? "text" : "password"}
          placeholder={passwordInputName}
          error={
            errors[passwordInputName] &&
            t("auth.fieldRequired", "Your {{field}} is required.", {
              field: passwordInputName,
              ns: "common"
            })
          }
          endIcon={
            <InputIconButton
              aria-label={
                showPassword
                  ? t("auth.password.hide", "hide password", { ns: "common" })
                  : t("auth.password.show", "show password", { ns: "common" })
              }
              onClick={togglePasswordVisibility}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </InputIconButton>
          }
        />
      )}

      <Button
        type="submit"
        sx={{
          ...modalButtonStyles
        }}
        loading={isLoading}
        loadingText={t("auth.signingIn", "Signing in...", { ns: "common" })}
      >
        {t("auth.login", "Login", { ns: "common" })}
      </Button>

      <ForgotPasswordLink />
    </form>
  );
};

export default BasicAuthHandler;

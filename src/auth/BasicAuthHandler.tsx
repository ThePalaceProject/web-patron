/** @jsxRuntime classic */
/** @jsx jsx */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { jsx } from "theme-ui";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Text } from "components/Text";
import Button, { InputIconButton } from "components/Button";
import FormInput from "components/form/FormInput";
import { modalButtonStyles } from "components/Modal";
import { ClientBasicMethod } from "interfaces";
import { generateToken } from "auth/useCredentials";
import useUser from "components/context/UserContext";
import { ServerError } from "errors";
import { Keyboard } from "types/opds1";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

type FormData = {
  [key: string]: string;
};

/**
 * Renders a form for completing basic auth.
 */
const BasicAuthHandler: React.FC<{
  method: ClientBasicMethod;
}> = ({ method }) => {
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
    <form
      onSubmit={onSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: 400
      }}
    >
      <Text sx={{ color: "ui.error", alignItems: "center", display: "flex" }}>
        {serverError && `${serverError.info.title}: ${serverError.info.detail}`}
      </Text>
      <FormInput
        name={usernameInputName}
        label={usernameInputName}
        id="login"
        placeholder={usernameInputName}
        {...register(usernameInputName, {
          required: true,
          maxLength: 25
        })}
        error={
          errors[usernameInputName] && `Your ${usernameInputName} is required.`
        }
      />
      {hasPasswordInput && (
        <FormInput
          name={passwordInputName}
          label={passwordInputName}
          {...register(passwordInputName, {
            required: true,
            maxLength: 25
          })}
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder={passwordInputName}
          error={
            errors[passwordInputName] &&
            `Your ${passwordInputName} is required.`
          }
          endIcon={
            <InputIconButton
              aria-label={`${showPassword ? "hide" : "show"} password`}
              type="button"
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
        loadingText="Signing in..."
      >
        Login
      </Button>
    </form>
  );
};

export default BasicAuthHandler;

/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Button from "./Button";
import useTypedSelector from "../hooks/useTypedSelector";
import { useForm, OnSubmit } from "react-hook-form";
import FormInput from "./form/FormInput";
import { useActions } from "./context/ActionsContext";
import { generateCredentials } from "opds-web-client/lib/utils/auth";
import {
  AuthMethod,
  AuthProvider,
  BasicAuthMethod
} from "opds-web-client/lib/interfaces";
import { AuthFormProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";

/**
 * Auth form
 *  - you can choose between different providers configured in the CM
 *  - each provider can give it's own form component?
 *  - each auth method provides its own labels for the username/password
 *  - handles validation (defined by the provider / plugin?)
 *  - handles submit (defined by the provider / plugin?)
 */

/**
 * 29999087654330
 * KJacTrMwBz$k
 */
type FormData = {
  barcode: string;
  pin: string;
};

const BasicAuthForm: React.FC<AuthFormProps<BasicAuthMethod>> = () => {
  const authState = useTypedSelector(state => state.auth);
  console.log(authState);
  const { showForm, cancel, callback, error, providers } = authState;
  const provider: AuthProvider<AuthMethod> | undefined = providers?.[0];
  const { actions, dispatch } = useActions();
  const { register, handleSubmit, errors } = useForm<FormData>();

  const onSubmit = ({ barcode, pin }) => {
    // create credentials
    const credentials = generateCredentials(barcode, pin);
    // save them with redux
    dispatch(
      actions.saveAuthCredentials({
        provider: provider.id,
        credentials
      })
    );
    // call the callback that was saved when the form was triggered
    callback?.();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <FormInput
        name="barcode"
        label="Barcode"
        id="barcode"
        placeholder="Barcode"
        ref={register({ required: true, maxLength: 25 })}
        error={errors?.barcode && "Your barcode is required."}
      />
      <FormInput
        name="pin"
        label="Pin"
        ref={register({ required: true, maxLength: 25 })}
        id="pin"
        type="password"
        placeholder="Pin"
        error={errors?.pin && "Your pin is required."}
      />
      <span sx={{ color: "warn" }}>{error}</span>
      <Button type="submit" sx={{ alignSelf: "flex-end", m: 2 }}>
        Login
      </Button>
    </form>
  );
};

export default BasicAuthForm;

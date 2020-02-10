/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { useDialogState, Dialog, DialogBackdrop } from "reakit/Dialog";
import useLibraryContext from "./context/LibraryContext";
import Button from "./Button";
import useTypedSelector from "../hooks/useTypedSelector";
import { useForm, OnSubmit } from "react-hook-form";
import FormInput from "./form/FormInput";
import { useActions } from "./context/ActionsContext";
import { generateCredentials } from "opds-web-client/lib/utils/auth";
import { AuthMethod, AuthProvider } from "opds-web-client/lib/interfaces";

const SignInOverlay = () => {
  const showForm = useTypedSelector(state => state.auth.showForm);
  const cancel = useTypedSelector(state => state.auth.cancel);

  const hide = () => cancel();

  // we use some properties from this, but the visibility is in redux state
  const dialog = useDialogState();
  const library = useLibraryContext();

  const onSubmit = data => console.log("submit", data);

  return (
    <React.Fragment>
      {/* <DialogDisclosure {...dialog} visible={isVisible} toggle={toggle}>
        Open dialog
      </DialogDisclosure> */}
      <DialogBackdrop
        {...dialog}
        sx={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: ["modal"],
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
        visible={showForm}
      >
        <Dialog
          {...dialog}
          visible={showForm}
          hide={hide}
          sx={{
            background: "white",
            borderRadius: 2,
            boxShadow: "modal",
            px: 4,
            py: 3,
            m: 2
          }}
          aria-label="Sign In"
        >
          <div sx={{ textAlign: "center" }}>
            <Styled.h2>{library.catalogName}</Styled.h2>
            <Styled.h4>Login</Styled.h4>
          </div>
          <SignInForm />
        </Dialog>
      </DialogBackdrop>
    </React.Fragment>
  );
};

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

const SignInForm: React.FC = () => {
  const authState = useTypedSelector(state => state.auth);
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

export default SignInOverlay;

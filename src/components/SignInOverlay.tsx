/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { useDialogState, Dialog, DialogBackdrop } from "reakit/Dialog";
import useLibraryContext from "./context/LibraryContext";
import TextInput from "./TextInput";
import Button from "./Button";
import useTypedSelector from "../hooks/useTypedSelector";
import FormLabel from "./form/FormLabel";

const SignInOverlay = () => {
  const isVisible = useTypedSelector(state => state.auth.showForm);
  const cancelAuth = useTypedSelector(state => state.auth.cancel);
  const authState = useTypedSelector(state => state.auth);
  console.log(authState);
  const hide = () => cancelAuth();

  // we use some properties from this, but the visibility is in redux state
  const dialog = useDialogState();
  const library = useLibraryContext();

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
        visible={isVisible}
      >
        <Dialog
          {...dialog}
          visible={isVisible}
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
          <form sx={{ display: "flex", flexDirection: "column" }}>
            <FormLabel for="barcode" sx={{ mx: 2 }}>
              Barcode
            </FormLabel>
            <TextInput id="barcode" placeholder="Barcode" sx={{ m: 2 }} />
            <FormLabel for="pin" sx={{ mx: 2 }}>
              Pin
            </FormLabel>
            <TextInput id="pin" placeholder="Pin" sx={{ m: 2 }} />
            <Button sx={{ alignSelf: "flex-end", m: 2 }}>Login</Button>
          </form>
        </Dialog>
      </DialogBackdrop>
    </React.Fragment>
  );
};

export default SignInOverlay;

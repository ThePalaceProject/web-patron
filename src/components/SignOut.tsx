/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Modal from "./Modal";
import { useDialogStore, DialogDisclosure } from "@ariakit/react/dialog";
import Button from "./Button";
import Stack from "./Stack";
import useUser from "components/context/UserContext";

interface SignOutProps {
  color?: string;
}

export const SignOut: React.FC<SignOutProps> = ({
  color = "ui.black"
}: SignOutProps) => {
  const dialog = useDialogStore();
  const { signOut } = useUser();
  function signOutAndClose() {
    signOut();
    dialog.hide();
  }
  return (
    <>
      <DialogDisclosure as={Button} color={color} store={dialog}>
        Sign Out
      </DialogDisclosure>
      <Modal
        dialog={dialog}
        role="alertdialog"
        hideOnClickOutside
        label="Sign Out"
        showClose={false}
      >
        <p>Are you sure you want to sign out?</p>
        <Stack sx={{ justifyContent: "center" }}>
          <Button variant="ghost" color="ui.gray.dark" onClick={dialog.hide}>
            Cancel
          </Button>
          <Button
            color="ui.error"
            onClick={signOutAndClose}
            aria-label="Confirm Sign Out"
          >
            Sign out
          </Button>
        </Stack>
      </Modal>
    </>
  );
};

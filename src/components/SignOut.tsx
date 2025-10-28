import * as React from "react";
import Modal from "./Modal";
import { useDialogStore, DialogDisclosure } from "@ariakit/react/dialog";
import Button from "./Button";
import Stack from "./Stack";
import useUser from "components/context/UserContext";
import { styleProps } from "./Button/styles";

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
      <DialogDisclosure store={dialog} sx={styleProps(color, "md", "ghost")}>
        Sign Out
      </DialogDisclosure>
      <Modal
        hideOnClickOutside
        dialog={dialog}
        role="alertdialog"
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

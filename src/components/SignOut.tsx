import * as React from "react";
import Modal from "./Modal";
import { useDialogStore, DialogDisclosure } from "@ariakit/react/dialog";
import Button from "./Button";
import Stack from "./Stack";
import useUser from "components/context/UserContext";
import { styleProps } from "./Button/styles";
import { useRouter } from "next/router";
import useLinkUtils from "hooks/useLinkUtils";
import useSignOutFlow from "hooks/useSignOutFlow";
import { useTranslation } from "next-i18next/pages";

interface SignOutProps {
  color?: string;
}

export const SignOut: React.FC<SignOutProps> = ({
  color = "ui.black"
}: SignOutProps) => {
  const { t } = useTranslation();
  const dialog = useDialogStore();
  const { signOut } = useUser();
  const router = useRouter();
  const { buildMultiLibraryLink } = useLinkUtils();
  const signOutFlow = useSignOutFlow();

  // Handles deferred sign-out: redirect-based auth methods (SAML, Clever, OIDC)
  // navigate to an unprotected page with performSignOut=true before clearing
  // credentials, ensuring the auth flow is not restarted mid-signout.
  React.useEffect(() => {
    if (router.query.performSignOut === "true") {
      signOut();
      router.replace(buildMultiLibraryLink("/signed-out"));
    }
  }, [router.query.performSignOut, signOut, router, buildMultiLibraryLink]);

  async function signOutAndClose() {
    dialog.hide();
    await signOutFlow();
  }

  return (
    <>
      <DialogDisclosure store={dialog} sx={styleProps(color, "md", "ghost")}>
        {t("signOut.signOut", "Sign Out")}
      </DialogDisclosure>
      <Modal
        hideOnClickOutside
        dialog={dialog}
        role="alertdialog"
        label={t("signOut.signOut", "Sign Out")}
        showClose={false}
      >
        <p>
          {t(
            "signOut.confirmationQuestion",
            "Are you sure you want to sign out?"
          )}
        </p>
        <Stack sx={{ justifyContent: "center" }}>
          <Button variant="ghost" color="ui.gray.dark" onClick={dialog.hide}>
            {t("actions.cancel", "Cancel", { ns: "common" })}
          </Button>
          <Button color="ui.error" onClick={signOutAndClose}>
            {t("signOut.signOut", "Sign Out")}
          </Button>
        </Stack>
      </Modal>
    </>
  );
};

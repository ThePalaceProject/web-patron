import * as React from "react";
import Modal from "./Modal";
import { useDialogStore, DialogDisclosure } from "@ariakit/react/dialog";
import Button from "./Button";
import Stack from "./Stack";
import useUser from "components/context/UserContext";
import { styleProps } from "./Button/styles";
import { OPDS1 } from "interfaces";
import { useRouter } from "next/router";
import useLinkUtils from "hooks/useLinkUtils";

interface SignOutProps {
  color?: string;
}

export const SignOut: React.FC<SignOutProps> = ({
  color = "ui.black"
}: SignOutProps) => {
  const dialog = useDialogStore();
  const { signOut, credentials } = useUser();
  const router = useRouter();
  const { buildMultiLibraryLink } = useLinkUtils();

  // Check if we should sign out (from query param after navigation).
  // This should be the case only for SAML or Clever auth.
  React.useEffect(() => {
    if (router.query.performSignOut === "true") {
      // We're on a non-protected page, it's safe to sign out.
      signOut();

      // Redirect to the signed-out warning page.
      router.replace(buildMultiLibraryLink("/signed-out"));
    }
  }, [router.query.performSignOut, signOut, router, buildMultiLibraryLink]);

  async function signOutAndClose() {
    // Get method type BEFORE signing out (while credentials still exist).
    const methodType = credentials?.methodType;

    dialog.hide();

    // For SAML/Clever auth, we need to navigate to a page that doesn't require
    // authentication, so that the page doesn't restart the authentication flow.
    // For these mechanisms, we explicitly indicate our intention to sign out.
    if (
      methodType === OPDS1.SamlAuthType ||
      methodType === OPDS1.CleverAuthType
    ) {
      const targetUrl = buildMultiLibraryLink("/");
      await router.push({
        pathname: targetUrl,
        query: { performSignOut: "true" }
      });
    } else {
      signOut();
    }
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

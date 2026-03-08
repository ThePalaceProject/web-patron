import * as React from "react";
import Modal from "./Modal";
import { useDialogStore, DialogDisclosure } from "@ariakit/react/dialog";
import Button from "./Button";
import Stack from "./Stack";
import useUser from "components/context/UserContext";
import { styleProps } from "./Button/styles";
import { OPDS1, ClientOidcMethod } from "interfaces";
import { useRouter } from "next/router";
import useLinkUtils from "hooks/useLinkUtils";
import useLibraryContext from "./context/LibraryContext";

interface SignOutProps {
  color?: string;
}

export const SignOut: React.FC<SignOutProps> = ({
  color = "ui.black"
}: SignOutProps) => {
  const dialog = useDialogStore();
  const { signOut, credentials, token } = useUser();
  const router = useRouter();
  const { buildMultiLibraryLink } = useLinkUtils();
  const { authMethods } = useLibraryContext();

  // Check if we should sign out (from query param after navigation).
  // This should be the case for SAML, Clever, or OIDC auth after logout redirect.
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

    // For OIDC auth with logout support, redirect to the logout endpoint
    if (methodType === OPDS1.OidcAuthType) {
      const oidcMethod = authMethods.find(
        m => m.type === OPDS1.OidcAuthType
      ) as ClientOidcMethod | undefined;

      if (oidcMethod?.logoutHref && token) {
        // Build the post-logout redirect URI (where we'll be redirected after logout)
        const postLogoutRedirectUri = `${window.location.origin}${buildMultiLibraryLink("/")}?performSignOut=true`;

        // Construct the logout URL with required parameters
        const logoutUrl = new URL(oidcMethod.logoutHref);
        logoutUrl.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);

        // Send the logout request with Authorization header so the backend can
        // identify the user and invalidate the token
        const response = await fetch(logoutUrl.toString(), {
          headers: { Authorization: token }
        });

        // Navigate to wherever the server directed us (IdP logout or post_logout_redirect_uri)
        window.location.href = response.url || postLogoutRedirectUri;
        return;
      }
    }

    // For SAML/Clever/OIDC (without logout support), we need to navigate to a page
    // that doesn't require authentication, so that the page doesn't restart the
    // authentication flow. For these mechanisms, we explicitly indicate our intention to sign out.
    if (
      methodType === OPDS1.SamlAuthType ||
      methodType === OPDS1.CleverAuthType ||
      methodType === OPDS1.OidcAuthType
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

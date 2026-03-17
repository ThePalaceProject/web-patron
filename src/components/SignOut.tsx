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
    // Get method type BEFORE signing out (while credentials still exist).
    const methodType = credentials?.methodType;

    dialog.hide();

    // For OIDC auth with logout support, redirect to the logout endpoint
    if (methodType === OPDS1.OidcAuthType) {
      const oidcMethod = authMethods.find(
        m => m.type === OPDS1.OidcAuthType
      ) as ClientOidcMethod | undefined;

      if (oidcMethod?.logoutHref && token) {
        // Local credentials are cleared eagerly before the server-side request.
        signOut();

        const signedOutUrl = `${window.location.origin}${buildMultiLibraryLink("/signed-out")}`;

        const logoutUrl = new URL(oidcMethod.logoutHref);
        logoutUrl.searchParams.set("post_logout_redirect_uri", signedOutUrl);

        try {
          /**
           * The Authorization header lets the backend identify and invalidate
           * the token. redirect: "manual" captures the first redirect without
           * following the full chain — the chain may include the IdP's
           * end_session endpoint, which requires a real browser navigation
           * (with cookies) to terminate the IdP session. For cross-origin
           * redirects the browser returns an opaque response and the Location
           * header is unreadable, so for now we always navigate to our own
           * signed-out page.
           */
          await fetch(logoutUrl.toString(), {
            headers: { Authorization: token },
            redirect: "manual"
          });
          window.location.href = signedOutUrl;
        } catch {
          // Local sign-out succeeded; server-side logout failed. Navigate to
          // signed-out page with an error flag so the user is informed.
          const errorUrl = new URL(signedOutUrl);
          errorUrl.searchParams.set("signoutServerError", "1");
          window.location.href = errorUrl.toString();
        }
        return;
      }
    }

    // Redirect-based auth methods require navigating to an unprotected page
    // before clearing credentials to avoid restarting the auth flow.
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
          <Button color="ui.error" onClick={signOutAndClose}>
            Confirm Sign Out
          </Button>
        </Stack>
      </Modal>
    </>
  );
};

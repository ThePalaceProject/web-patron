import * as React from "react";
import Modal from "./Modal";
import { useDialogStore, DialogDisclosure } from "@ariakit/react/dialog";
import Button from "./Button";
import Stack from "./Stack";
import useUser from "components/context/UserContext";
import { styleProps } from "./Button/styles";
import { OPDS1, ClientOidcMethod } from "interfaces";
import { normalizeLink, UriTemplateTerms } from "utils/opds";
import { useRouter } from "next/router";
import useLinkUtils from "hooks/useLinkUtils";
import useLibraryContext from "./context/LibraryContext";

interface SignOutProps {
  color?: string;
}

const SIGNOUT_URI_TEMPLATE_FALLBACK_VARIABLES = [
  "post_logout_redirect_uri",
  "redirect_uri"
] as const;

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

      if (oidcMethod?.logoutLink && token) {
        // Local credentials are cleared eagerly before the server-side request.
        signOut();

        const signedOutUrl = `${window.location.origin}${buildMultiLibraryLink("/signed-out")}`;

        try {
          /*
           * Resolve the logout URL, expanding any URI template. The term value
           * map handles servers that use uri_template_variables to declare the
           * redirect-URI variable's semantic type; the fallback covers servers
           * that omit that map but still use the conventional variable name.
           * normalizeLink throws when a required template variable has no value,
           * so it must be inside the try block to be handled like any other
           * logout failure.
           */
          const { href: logoutUrl } = normalizeLink(oidcMethod.logoutLink, {
            termValues: { [UriTemplateTerms.REDIRECT_URI]: signedOutUrl },
            fallbacks: Object.fromEntries(
              SIGNOUT_URI_TEMPLATE_FALLBACK_VARIABLES.map(v => [
                v,
                signedOutUrl
              ])
            )
          });
          /**
           * The Authorization header lets the backend identify and invalidate
           * the token. redirect: "manual" captures the first redirect without
           * following the full chain — the chain may include the IdP's
           * end_session endpoint, which requires a real browser navigation
           * (with cookies) to terminate the IdP session. For cross-origin
           * redirects the browser returns an opaque response and the Location
           * header is unreadable, so we always navigate to our own signed-out
           * page regardless of the redirect destination.
           *
           * redirect: "manual" also prevents fetch from throwing on non-2xx
           * status codes, so we check response.ok explicitly and throw to
           * reach the catch block on HTTP errors (e.g. 500).
           */
          const response = await fetch(logoutUrl, {
            headers: { Authorization: token },
            redirect: "manual"
          });
          if (!response.ok && response.type !== "opaqueredirect") {
            throw new Error(`Logout endpoint returned ${response.status}`);
          }
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

import { useRouter } from "next/router";
import useUser from "components/context/UserContext";
import useLibraryContext from "components/context/LibraryContext";
import useLinkUtils from "hooks/useLinkUtils";
import { OPDS1, ClientOidcMethod, ClientSamlMethod } from "interfaces";
import { normalizeLink, UriTemplateTerms, TemplatedLink } from "utils/opds";

const SIGNOUT_URI_TEMPLATE_FALLBACK_VARIABLES = [
  "post_logout_redirect_uri",
  "redirect_uri"
] as const;

/*
 * Calls the server-side logout endpoint (with Authorization header and URI
 * template expansion), then navigates to signedOutUrl. Swallows any server
 * error because credentials have already been cleared locally before this
 * is called.
 */
async function performLogoutRequest(
  logoutLink: TemplatedLink,
  token: string,
  signedOutUrl: string
): Promise<void> {
  try {
    const { href: logoutUrl } = normalizeLink(logoutLink, {
      termValues: { [UriTemplateTerms.REDIRECT_URI]: signedOutUrl },
      fallbacks: Object.fromEntries(
        SIGNOUT_URI_TEMPLATE_FALLBACK_VARIABLES.map(v => [v, signedOutUrl])
      )
    });
    const response = await fetch(logoutUrl, {
      headers: { Authorization: token },
      redirect: "manual"
    });
    if (!response.ok && response.type !== "opaqueredirect") {
      throw new Error(`Logout endpoint returned ${response.status}`);
    }
  } catch {
    // TODO: For now, we swallow the server-side logout failure, since
    //  the browser has already dropped its local Palace credentials. In
    //  the future, we can report the error here.
  } finally {
    window.location.href = signedOutUrl;
  }
}

/**
 * Returns a function that signs the user out of the current library the
 * same way the Sign Out button does. OIDC and SAML methods with a logout
 * link call the server logout endpoint. Other redirect-based methods
 * navigate to an unprotected page with performSignOut=true first (the
 * SignOut component finishes the sign-out there), so the auth flow does
 * not restart mid-signout. All other methods sign out in place.
 */
export default function useSignOutFlow(): () => Promise<void> {
  const { signOut, credentials, token } = useUser();
  const router = useRouter();
  const { buildMultiLibraryLink } = useLinkUtils();
  const { authMethods } = useLibraryContext();

  return async function signOutFlow() {
    // Get method type BEFORE signing out (while credentials still exist).
    const methodType = credentials?.methodType;

    // For OIDC or SAML auth with a server-side logout endpoint, call it before
    // navigating to the signed-out page.
    if (methodType === OPDS1.OidcAuthType) {
      const oidcMethod = authMethods.find(
        m => m.type === OPDS1.OidcAuthType
      ) as ClientOidcMethod | undefined;

      if (oidcMethod?.logoutLink && token) {
        signOut();
        const signedOutUrl = `${window.location.origin}${buildMultiLibraryLink("/signed-out")}`;
        await performLogoutRequest(oidcMethod.logoutLink, token, signedOutUrl);
        return;
      }
    }

    if (methodType === OPDS1.SamlAuthType) {
      const samlMethod = authMethods.find(
        m => m.type === OPDS1.SamlAuthType
      ) as ClientSamlMethod | undefined;

      if (samlMethod?.logoutLink && token) {
        signOut();
        const signedOutUrl = `${window.location.origin}${buildMultiLibraryLink("/signed-out")}`;
        await performLogoutRequest(samlMethod.logoutLink, token, signedOutUrl);
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
  };
}

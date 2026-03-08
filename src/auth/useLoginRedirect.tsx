import extractParam from "dataflow/utils";
import useLinkUtils from "hooks/useLinkUtils";
import { useRouter } from "next/router";
import { LOGIN_REDIRECT_QUERY_PARAM } from "utils/constants";
import { IS_SERVER } from "utils/env";

/**
 * Extracts the redirect url stored in the browser url bar and returns
 * a version including the origin (fullSuccessUrl) or a version that is
 * just a path (successPath).
 */
export default function useLoginRedirectUrl() {
  const { buildMultiLibraryLink } = useLinkUtils();
  const { query } = useRouter();

  const catalogRootPath = buildMultiLibraryLink("/");
  const nextPath = extractParam(query, LOGIN_REDIRECT_QUERY_PARAM);

  // if the redirect url is the login url, we would end up in a loop.
  const isLoginPath = nextPath?.includes("/login");
  // if it is a full url, it was invalidly set somehow
  const isFullUrl = nextPath?.startsWith("http");
  // if the redirect url is the home page, choose the catalog root instead
  const isHomePage = nextPath === "/";
  // if the redirect url is the signed-out page, redirect to catalog root instead
  // (logging in should never return you to the "important security notice" page)
  const isSignedOutPage = nextPath?.includes("/signed-out");
  // if the redirect url contains performSignOut, reject it — after OIDC login the CM
  // would redirect back to that URL, the SignOut effect would fire, and the user would
  // be signed out immediately
  const hasPerformSignOut = nextPath?.includes("performSignOut");

  // Check if redirect is to an auth-protected page
  const isAuthProtectedPage = nextPath?.includes("/loans");

  // Check if there's a login error (indicates auth just failed).
  // Check both loginError (from our code) and error (from backend redirect).
  const hasLoginError = query.loginError || query.error;

  // If we have an error AND we're trying to redirect to an auth-protected page,
  // this would create a loop, which we can avoid by redirecting to the
  // catalog page, if necessary (see below).
  const wouldCreateLoop = isAuthProtectedPage && hasLoginError;

  // Go to catalog root if nextPath is invalid or would cause a loop.
  const successPath =
    !nextPath || isLoginPath || isHomePage || isFullUrl || wouldCreateLoop || isSignedOutPage || hasPerformSignOut
      ? catalogRootPath
      : nextPath;

  const fullSuccessUrl = IS_SERVER
    ? ""
    : `${window.location.origin}${successPath}`;

  return {
    fullSuccessUrl,
    successPath
  };
}

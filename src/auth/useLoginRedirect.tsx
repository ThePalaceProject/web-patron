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

  const isSignedOutPage = nextPath?.endsWith("/signed-out");
  const hasPerformSignOut = urlHasPerformSignOut(nextPath);

  const isAuthProtectedPage = nextPath?.includes("/loans");

  // loginError is set by our code; error comes from backend redirects.
  const hasLoginError = query.loginError || query.error;

  // Redirecting to a protected page after a login failure would restart the
  // auth flow and create a loop.
  const wouldCreateLoop = isAuthProtectedPage && hasLoginError;

  // Go to catalog root if nextPath is invalid or would cause a loop.
  const successPath =
    !nextPath ||
    isLoginPath ||
    isHomePage ||
    isFullUrl ||
    wouldCreateLoop ||
    isSignedOutPage ||
    hasPerformSignOut
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

/*
 * Helper function to determine if a URL has a 'performSignOut' query parameter.
 */
function urlHasPerformSignOut(path: string | null | undefined): boolean {
  if (!path) return false;
  try {
    // Use a dummy base so relative paths parse correctly on the server.
    return new URL(path, "http://localhost").searchParams.has("performSignOut");
  } catch {
    return false;
  }
}

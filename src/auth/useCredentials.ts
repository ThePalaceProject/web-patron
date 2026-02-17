import * as React from "react";
import Cookie from "js-cookie";
import { AuthCredentials, OPDS1, AppAuthMethod } from "interfaces";
import { IS_SERVER } from "utils/env";
import { NextRouter, useRouter } from "next/router";
import { generateCredentials } from "utils/auth";
import { REDIRECT_LOGIN_QUERY_PARAM } from "utils/constants";
import useLogin from "./useLogin";
import useLibraryContext from "components/context/LibraryContext";

/**
 * This hook:
 *  - Searches for credentials in cookies
 *  - Syncs those cookies with an internal react state so that
 *    changes to the credentials causes a re-render. Just
 *    changing the cookie wouldn't do this.
 *  - Searches for credentials embedded in the browser url. If
 *    if finds a token, it extracts it and sets it as the current
 *    credentials.
 */
export default function useCredentials(slug: string | null) {
  const router = useRouter();
  const { initLogin } = useLogin();
  const { authMethods } = useLibraryContext();
  const [credentialsState, setCredentialsState] = React.useState<
    AuthCredentials | undefined
  >(getCredentialsCookie(slug));
  // sync up cookie state with react state
  React.useEffect(() => {
    const cookie = getCredentialsCookie(slug);
    if (cookie) setCredentialsState(cookie);
  }, [slug]);

  // set both cookie and state credentials
  const setCredentials = React.useCallback(
    (creds: AuthCredentials) => {
      setCredentialsState(creds);
      setCredentialsCookie(slug, creds);
    },
    [slug]
  );

  // clear both cookie and state credentials
  const clear = React.useCallback(() => {
    setCredentialsState(undefined);
    clearCredentialsCookie(slug);
  }, [slug]);

  // Check for SAML/Clever error in URL and redirect to login with error message.
  // Uses a ref to ensure we only process each error once (prevent infinite loops)
  const processedErrorRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!IS_SERVER && router.query.error) {
      const errorParam = router.query.error as string;

      // Only process if we haven't already processed this exact error
      if (processedErrorRef.current === errorParam) {
        return;
      }

      // Mark this error as processed
      processedErrorRef.current = errorParam;

      // Parse and redirect to login page
      try {
        const errorObj = JSON.parse(errorParam);
        const errorMessage =
          errorObj?.title && errorObj?.detail
            ? `${errorObj.title}: ${errorObj.detail}`
            : "Authentication completed successfully, but your account was not recognized. Please contact your library for assistance.";

        // Redirect to login page with error message.
        // Don't use current page as redirect since auth just failed.
        // Note: useLogin filters out 'error' param to prevent it from being copied to login URL.
        initLogin(undefined, errorMessage, false);
      } catch {
        // If JSON parsing fails, show generic error.
        initLogin(undefined, "Authentication failed. Please try again.", false);
      }
    } else if (!router.query.error) {
      // Clear the ref when there's no error param (e.g., navigated away)
      processedErrorRef.current = null;
    }
  }, [router.query.error, initLogin]);

  // use credentials from browser url if they exist
  const { token: urlToken, methodType: urlMethodType } =
    getUrlCredentials(router, authMethods) ?? {};

  React.useEffect(() => {
    if (urlToken && urlMethodType) {
      setCredentials({ token: urlToken, methodType: urlMethodType });
    }
  }, [urlToken, urlMethodType, setCredentials]);

  return {
    credentials: credentialsState,
    setCredentials,
    clearCredentials: clear
  };
}

/**
 * COOKIE CREDENTIALS
 */
/**
 * If you pass a librarySlug, the cookie will be scoped to the
 * library you are viewing. This is useful in a multi library setup.
 */
function cookieName(librarySlug: string | null): string {
  const AUTH_COOKIE_NAME = "CPW_AUTH_COOKIE";
  return `${AUTH_COOKIE_NAME}/${librarySlug}`;
}

function getCredentialsCookie(
  librarySlug: string | null
): AuthCredentials | undefined {
  const credentials = Cookie.get(cookieName(librarySlug));
  return credentials ? JSON.parse(credentials) : undefined;
}

function setCredentialsCookie(
  librarySlug: string | null,
  credentials: AuthCredentials
) {
  Cookie.set(cookieName(librarySlug), JSON.stringify(credentials));
}

function clearCredentialsCookie(librarySlug: string | null) {
  Cookie.remove(cookieName(librarySlug));
}

export function generateToken(username: string, password?: string) {
  return generateCredentials(username, password);
}

/**
 * URL CREDENTIALS
 */
function getUrlCredentials(
  router: NextRouter,
  authMethods: AppAuthMethod[]
): AuthCredentials | undefined {
  /* TODO: throw error if access tokens exist at the same time as this is an invalid state that shouldn't be reached */
  return IS_SERVER
    ? undefined
    : (lookForCleverCredentials(router) ??
        lookForRedirectAuthCredentials(router, authMethods));
}

// check for clever credentials
function lookForCleverCredentials(
  router: NextRouter
): AuthCredentials | undefined {
  if (!IS_SERVER) {
    const accessTokenKey = "access_token=";
    if (window?.location?.hash) {
      if (window.location.hash.indexOf(accessTokenKey) !== -1) {
        const hash = window.location.hash;
        const accessTokenStart = hash.indexOf(accessTokenKey);
        const accessToken = hash
          .slice(accessTokenStart + accessTokenKey.length)
          .split("&")[0];
        const token = `Bearer ${accessToken}`;

        // Clear Clever hash from URL to avoid re-authentication after sign out.
        router.replace(
          { pathname: router.pathname, query: router.query, hash: "" },
          undefined,
          { shallow: true }
        );

        return { token, methodType: OPDS1.CleverAuthType };
      }
    }
  }
}

// check for redirect-based auth credentials (SAML/OIDC)
// Both use the same query parameter, so we determine which based on library config
function lookForRedirectAuthCredentials(
  router: NextRouter,
  authMethods: AppAuthMethod[]
): AuthCredentials | undefined {
  const { [REDIRECT_LOGIN_QUERY_PARAM]: accessToken } = router.query;
  if (accessToken) {
    if (!IS_SERVER && typeof window !== "undefined") {
      // Clear token from URL to avoid re-authentication after sign out.
      const { [REDIRECT_LOGIN_QUERY_PARAM]: _, ...restQuery } = router.query;
      router.replace(
        { pathname: router.pathname, query: restQuery },
        undefined,
        { shallow: true }
      );
    }

    // Determine which redirect auth type to use based on order in authentication document.
    // We authenticate with the first supported auth type, so use that order here.
    const redirectAuthMethod = authMethods.find(
      m => m.type === OPDS1.OidcAuthType || m.type === OPDS1.SamlAuthType
    );

    // Use the first redirect-based auth method found, or default to SAML for backward compatibility
    const methodType = redirectAuthMethod?.type ?? OPDS1.SamlAuthType;

    return {
      token: `Bearer ${accessToken}`,
      methodType
    };
  }
}

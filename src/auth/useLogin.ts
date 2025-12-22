import * as React from "react";
import { useRouter } from "next/router";
import { LOGIN_REDIRECT_QUERY_PARAM } from "utils/constants";
import { UrlObject } from "url";
import { IS_SERVER } from "utils/env";
import useLibraryContext from "components/context/LibraryContext";

export default function useLogin() {
  const { query, push, asPath, isReady } = useRouter();
  const { slug } = useLibraryContext();

  const getLoginUrl = React.useCallback(
    (
      methodId?: string,
      error?: string,
      useCurrentPageAsRedirect = true
    ): UrlObject => {
      const pathname = methodId
        ? "/[library]/login/[methodId]"
        : "/[library]/login";

      // preserves existing query parameters, but filter out 'error' to prevent loops
      // (error param comes from backend redirects and should not be copied to login URL)
      const { error: _, ...cleanQuery } = query;
      const newQuery = methodId ? { ...cleanQuery, methodId } : cleanQuery;
      // make sure that library is set (it is not already set on home page).
      newQuery.library = slug;

      // sets the login error if there is one
      if (error) newQuery.loginError = error;

      // if no redirect is set, redirect to the current page (unless explicitly disabled)
      if (!newQuery[LOGIN_REDIRECT_QUERY_PARAM] && useCurrentPageAsRedirect) {
        // do not set the redirect if the router is not yet ready and populated
        // with client-side information. This would mean we are rendering server-side
        // and would cause a full url to be put in the login redirect, which is invalid
        if (isReady) {
          newQuery[LOGIN_REDIRECT_QUERY_PARAM] = asPath;
        }
      }

      return {
        pathname,
        query: newQuery
      };
    },
    [query, asPath, slug, isReady]
  );

  // an error can be passed in from a previous login attempt to show on
  // the login screen. It will be passed to the page as a url query param.
  const initLogin = React.useCallback(
    (methodId?: string, error?: string, useCurrentPageAsRedirect = true) => {
      const urlObject = getLoginUrl(methodId, error, useCurrentPageAsRedirect);
      if (!IS_SERVER) {
        // redirect to the login page
        push(urlObject, undefined, { shallow: true });
      }
    },
    [push, getLoginUrl]
  );

  // the login url without any method selected
  const baseLoginUrl = getLoginUrl();

  return {
    getLoginUrl,
    initLogin,
    baseLoginUrl
  };
}

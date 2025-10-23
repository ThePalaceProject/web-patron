/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useLibraryContext from "../components/context/LibraryContext";
import Stack from "../components/Stack";
import useUser from "components/context/UserContext";
import LoadingIndicator from "components/LoadingIndicator";
import { useRouter } from "next/router";
import Head from "next/head";
import BreadcrumbBar from "components/BreadcrumbBar";
import useLoginRedirectUrl from "auth/useLoginRedirect";
import { H1, Text } from "components/Text";

/**
 * Redirects on success
 * Shows loader if the state is still loading
 * Adds wrapping components for styling
 */
interface LoginWrapperProps {
  children?: React.ReactNode;
}

const LoginWrapper = ({ children }: LoginWrapperProps) => {
  const { isAuthenticated, isLoading } = useUser();
  const { catalogName } = useLibraryContext();
  const { push } = useRouter();
  const { successPath } = useLoginRedirectUrl();

  /**
   * If the user becomes authenticated, we can redirect
   * to the successUrl
   */
  React.useEffect(() => {
    if (isAuthenticated) {
      push(successPath, undefined, { shallow: true });
    }
  }, [isAuthenticated, push, successPath]);

  return (
    <div
      sx={{
        flex: 1
      }}
    >
      <Head>
        <title>Login - {catalogName}</title>
      </Head>
      <BreadcrumbBar currentLocation="Login" />
      <div
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Stack
          direction="column"
          sx={{ p: 4, m: 4, border: "solid", borderRadius: "card" }}
        >
          <div sx={{ textAlign: "center", p: 0 }}>
            <H1
              aria-label={`Log in to ${catalogName}`}
              variant="text.headers.secondary"
            >
              {catalogName}
              <Text
                aria-hidden="true"
                variant="text.headers.tertiary"
                sx={{
                  display: "block",
                  mt: 15
                }}
              >
                Login
              </Text>
            </H1>
          </div>
          {/* when we just become authenticated, we display the
              loading indicator until the page redirects away
           */}

          {isLoading || isAuthenticated ? (
            <Stack direction="column" sx={{ alignItems: "center" }}>
              <LoadingIndicator />
              Logging in...
            </Stack>
          ) : (
            children
          )}
        </Stack>
      </div>
    </div>
  );
};

export default LoginWrapper;

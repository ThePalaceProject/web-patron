import useLogin from "auth/useLogin";
import useUser from "components/context/UserContext";
import { PageLoader } from "components/LoadingIndicator";
import { useRouter } from "next/router";
import React from "react";

/**
 * This will show a message and redirect the user to the login
 * page if they try to access a route they are not permitted to see.
 */

interface Props {
  children: React.ReactNode;
}
const AuthProtectedRoute = ({ children }: Props) => {
  const { isLoading, isAuthenticated, token, error } = useUser();
  const { initLogin } = useLogin();
  const { query } = useRouter();

  // An 'error' query param indicates the IdP redirected back with a failure.
  // Passing it as loginError prevents the auth handler from immediately
  // re-redirecting to the IdP, breaking an otherwise infinite loop.
  const idpError = typeof query.error === "string" ? query.error : undefined;

  React.useEffect(() => {
    if ((!token || error) && !isLoading) {
      initLogin(undefined, idpError);
    }
  }, [initLogin, token, error, isLoading, idpError]);

  if (isAuthenticated) {
    return <>{children}</>;
  }
  if (isLoading) {
    return <PageLoader />;
  }
  return <Unauthorized />;
};

export default AuthProtectedRoute;

const Unauthorized = () => {
  return (
    <div
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
      }}
    >
      <h4>You need to be signed in to view this page.</h4>
    </div>
  );
};

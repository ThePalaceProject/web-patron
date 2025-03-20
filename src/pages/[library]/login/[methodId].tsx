import * as React from "react";
import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import LayoutPage from "components/LayoutPage";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import LoginWrapper from "auth/LoginWrapper";
import { useRouter } from "next/router";
import extractParam from "dataflow/utils";
import useLibraryContext from "components/context/LibraryContext";
import track from "analytics/track";
import ApplicationError from "errors";
import useLogin from "auth/useLogin";
import authenticationHandlers, {
  AuthHandlerWrapper
} from "../../../auth/AuthenticationHandlers";

const LoginHandlerPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <LayoutPage library={library} error={error}>
      <LoginWrapper>
        <LoginComponent />
      </LoginWrapper>
    </LayoutPage>
  );
};

const LoginComponent = () => {
  const router = useRouter();
  const { authMethods } = useLibraryContext();
  const methodId = extractParam(router.query, "methodId");
  const method = authMethods.find(m => m.id === methodId);
  const { initLogin } = useLogin();

  if (!method) {
    track.error(
      new ApplicationError({
        title: "Login Method Not Available",
        detail: `Attempted to access authentication method that was not found. Method ID: ${methodId}`
      })
    );
    // go back to base login page
    initLogin();
    // Adding a return here so that TypeScript can narrow `method`s type.
    return null;
  }

  const AuthHandler: React.ComponentType = authenticationHandlers[method.type];
  if (!AuthHandler) {
    // We should never get here, but if we do, we want to know about it.
    track.error(
      new ApplicationError({
        title: "Login Method Not Supported",
        detail: `Failed to render what should be a supported authentication method. Is the LoginPicker method filtering correctly configured? Method ID: ${methodId}`
      })
    );
    return <p>This authentication method is not supported.</p>;
  }

  // Finally, the normal path leads to rendering the correct authentication handler.
  return <AuthHandlerWrapper method={method} />;
};

export const getStaticProps: GetStaticProps = withAppProps();

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};

export default LoginHandlerPage;

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
import AuthenticationHandler from "../../../auth/AuthenticationHandler";

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
    // `initLogin() redirects us away, so we shouldn't need the `return` here. But
    // TS doesn't know that, so we return here to narrow `method`s type below.
    return null;
  }

  // Return the right component for the method.
  return <AuthenticationHandler method={method} />;
};

export const getStaticProps: GetStaticProps = withAppProps();

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};

export default LoginHandlerPage;

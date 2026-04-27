import * as React from "react";
import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import LayoutPage from "components/LayoutPage";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import LoginWrapper from "auth/LoginWrapper";
import Login from "auth/Login";
import OpenEbooksLoginPicker from "auth/OpenEbooksLoginPicker";
import { useAppConfig } from "components/context/AppConfigContext";

const LoginPage: NextPage<AppProps> = ({ library, error }) => {
  const { openebooks } = useAppConfig();
  return (
    <LayoutPage library={library} error={error}>
      <LoginWrapper>
        {openebooks ? <OpenEbooksLoginPicker /> : <Login />}
      </LoginWrapper>
    </LayoutPage>
  );
};

export const getStaticProps: GetStaticProps = withAppProps();

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true
  };
};

export default LoginPage;

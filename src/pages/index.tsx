import * as React from "react";
import { GetServerSideProps, NextPage } from "next";
import OpenEbooksLandingPage from "components/OpenEbooksLanding";
import MultiLibraryHome from "components/MultiLibraryHome";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import { getAppConfig } from "server/appConfig";
import type { AppConfig } from "interfaces";

type HomeProps = AppProps & { appConfig: AppConfig };

const HomePage: NextPage<HomeProps> = ({ appConfig, ...rest }) => {
  if (appConfig.openebooks) {
    return <OpenEbooksLandingPage {...rest} />;
  }
  return <MultiLibraryHome />;
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async ctx => {
  const appConfig = await getAppConfig();
  if (appConfig.openebooks) {
    const fetchProps = withAppProps(
      undefined,
      appConfig.openebooks.defaultLibrary
    );
    const result = await fetchProps(ctx as never);
    if ("redirect" in result || "notFound" in result) return result;
    return { props: { ...(await result.props), appConfig } };
  }
  return { props: { appConfig } };
};

export default HomePage;

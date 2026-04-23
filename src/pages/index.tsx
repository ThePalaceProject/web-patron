import * as React from "react";
import { GetServerSideProps, NextPage } from "next";
import OpenEbooksLandingPage from "components/OpenEbooksLanding";
import MultiLibraryHome from "components/MultiLibraryHome";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import { getAppConfig } from "server/appConfig";
import { AppSetupError } from "errors";
import type { AppConfig } from "interfaces";
import FALLBACK_APP_CONFIG from "config/fallbackAppConfig";

type HomeProps = AppProps & { appConfig: AppConfig };

const HomePage: NextPage<HomeProps> = ({ appConfig, ...rest }) => {
  if (appConfig.openebooks) {
    return <OpenEbooksLandingPage {...rest} />;
  }
  return <MultiLibraryHome />;
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async ctx => {
  let appConfig: AppConfig;
  try {
    appConfig = await getAppConfig();
  } catch (e) {
    if (e instanceof AppSetupError) {
      return { props: { appConfig: FALLBACK_APP_CONFIG } };
    }
    throw e;
  }
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

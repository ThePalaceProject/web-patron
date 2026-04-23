import * as React from "react";
import { GetStaticProps, GetStaticPropsResult, NextPage } from "next";
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

export const getStaticProps: GetStaticProps<HomeProps> = async ctx => {
  let appConfig: AppConfig;
  try {
    appConfig = await getAppConfig();
  } catch (e) {
    if (e instanceof AppSetupError) {
      return { props: { appConfig: FALLBACK_APP_CONFIG }, revalidate: 1 };
    }
    throw e;
  }
  if (appConfig.openebooks) {
    const innerGSP = withAppProps(
      undefined,
      appConfig.openebooks.defaultLibrary
    );
    const result = await innerGSP(ctx);
    if ("props" in result) {
      return { ...result, props: { ...result.props, appConfig } };
    }
    return result as GetStaticPropsResult<HomeProps>;
  }
  return { props: { appConfig }, revalidate: 60 * 60 };
};

export default HomePage;

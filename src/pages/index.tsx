import * as React from "react";
import { GetServerSideProps, NextPage } from "next";
import OpenEbooksLandingPage from "components/OpenEbooksLanding";
import MultiLibraryHome from "components/MultiLibraryHome";
import { withAppPropsSSR, AppProps } from "dataflow/withAppProps";
import { getTranslationProps } from "dataflow/translationProps";
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
    const fetchProps = withAppPropsSSR(
      undefined,
      appConfig.openebooks.defaultLibrary
    );
    const result = await fetchProps(ctx);
    if ("redirect" in result || "notFound" in result) return result;
    return { props: { ...(await result.props), appConfig } };
  }
  /*
   * MultiLibraryHome calls useTranslation, so this branch has to supply the
   * i18n props itself
   */
  return { props: { appConfig, ...(await getTranslationProps(ctx.locale)) } };
};

export default HomePage;

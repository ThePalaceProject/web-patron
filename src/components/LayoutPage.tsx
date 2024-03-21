import * as React from "react";
import Page from "./Page";
import Layout from "./Layout";
import { AppProps } from "dataflow/withAppProps";

/* LayoutPage is a Page with Header and Footer from Layout, this should be used to wrap pages within the app with sitewide navigation. */

type AppPropsWithChildren = AppProps & { children?: React.ReactNode };

const LayoutPage = ({ children, library, error }: AppPropsWithChildren) => {
  return (
    <Page library={library} error={error}>
      <Layout>{children}</Layout>
    </Page>
  );
};

export default LayoutPage;

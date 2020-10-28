import * as React from "react";
import Page from "./Page";
import Layout from "./Layout";
import { AppProps } from "dataflow/withAppProps";

/* LayoutPage is a Page with Header and Footer from Layout, this should be used to wrap pages within the app with sitewide navigation. */

const LayoutPage: React.FC<{
  props: AppProps;
  showHeader?: boolean;
  showFooter?: boolean;
}> = ({ children, props, showHeader = true, showFooter = true }) => {
  const { library, error } = props;
  return (
    <Page library={library} error={error}>
      <Layout showHeader={showHeader} showFooter={showFooter}>
        {children}
      </Layout>
    </Page>
  );
};

export default LayoutPage;

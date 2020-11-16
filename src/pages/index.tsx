import * as React from "react";
import { NextPage, GetStaticProps } from "next";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import { APP_CONFIG } from "utils/env";
import OpenEbooksLandingComponent from "components/OpenEbooksLanding";
import LayoutPage from "components/LayoutPage";

const CollectionPage: NextPage<AppProps> = ({ library, error }) => {
  const props: AppProps = {
    library: library,
    error: error
  };
  return (
    <>
      <LayoutPage props={props} showHeader={false}>
        <OpenEbooksLandingComponent />
      </LayoutPage>
    </>
  );
};

const librarySlug = APP_CONFIG.companionApp === "openebooks" ? "qa" : undefined;
export const getStaticProps: GetStaticProps = withAppProps(librarySlug);

export default CollectionPage;

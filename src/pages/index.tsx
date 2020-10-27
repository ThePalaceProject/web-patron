import * as React from "react";
import { NextPage, GetStaticProps } from "next";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import { APP_CONFIG } from "config";
import OpenEbooksLandingComponent from "components/OpenEbooksLanding";
import LayoutPage from "components/LayoutPage";

const CollectionPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <>
      <LayoutPage library={library} error={error}>
        <OpenEbooksLandingComponent />
      </LayoutPage>
    </>
  );
};

const librarySlug = APP_CONFIG.companionApp === "openebooks" ? "qa" : undefined;
export const getStaticProps: GetStaticProps = withAppProps(librarySlug);

export default CollectionPage;

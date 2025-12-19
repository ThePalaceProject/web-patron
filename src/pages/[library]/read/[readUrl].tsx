import * as React from "react";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import LayoutPage from "components/LayoutPage";
import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import InternalReader from "components/internalReader";

const ReaderPage: NextPage<AppProps> = ({ library, error }) => {
  return (
    <LayoutPage library={library} error={error}>
      <InternalReader />
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

export default ReaderPage;

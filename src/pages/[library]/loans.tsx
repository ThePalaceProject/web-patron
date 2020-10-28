import * as React from "react";
import { NextPage, GetStaticPaths, GetStaticProps } from "next";
import LayoutPage from "components/LayoutPage";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import MyBooks from "components/MyBooks";

const MyBooksPage: NextPage<AppProps> = ({ library, error }) => {
  const props = { library: library, error: error };

  return (
    <LayoutPage props={props}>
      <MyBooks />
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

export default MyBooksPage;

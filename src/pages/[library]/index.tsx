import * as React from "react";
import Collection from "components/Collection";
import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import LayoutPage from "components/LayoutPage";
import withAppProps, { AppProps } from "dataflow/withAppProps";
import { useTranslation } from "next-i18next/pages";

const LibraryHome: NextPage<AppProps> = ({ library, error }) => {
  const { t } = useTranslation();
  return (
    <LayoutPage library={library} error={error}>
      <Collection
        title={t("library.home", "{{catalogName}} Home", {
          catalogName: library?.catalogName
        })}
      />
    </LayoutPage>
  );
};

export const getStaticProps: GetStaticProps = withAppProps();

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking"
  };
};

export default LibraryHome;

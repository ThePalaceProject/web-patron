import * as React from "react";

import Collection from "../../components/Collection";
import Layout from "../../components/Layout";

import ErrorPage from "../404";
import useLibraryContext from "components/context/LibraryContext";
import PageTitle from "components/PageTitle";

const LibraryHome = ({ statusCode }: { statusCode?: number }) => {
  const libraryTitle = useLibraryContext().catalogName;

  return (
    <Layout bg="ui.gray.lightWarm">
      <PageTitle>{libraryTitle} Home</PageTitle>
      {statusCode === 404 ? <ErrorPage /> : <Collection />}
    </Layout>
  );
};

export default LibraryHome;

import * as React from "react";

import Collection from "../../components/Collection";
import Layout from "../../components/Layout";

import ErrorPage from "../404";
import useLibraryContext from "components/context/LibraryContext";

const LibraryHome = ({ statusCode }: { statusCode?: number }) => {
  const libraryTitle = useLibraryContext().catalogName;

  return (
    <Layout>
      {statusCode === 404 ? (
        <ErrorPage />
      ) : (
        <Collection title={`${libraryTitle} Home`} />
      )}
    </Layout>
  );
};

export default LibraryHome;

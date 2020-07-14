import * as React from "react";

import Collection from "../../../components/Collection";
import Layout from "../../../components/Layout";
import ErrorPage from "../../404";

const CollectionPage = ({ statusCode }: { statusCode?: number }) => {
  return <Layout>{statusCode === 404 ? <ErrorPage /> : <Collection />}</Layout>;
};

export default CollectionPage;

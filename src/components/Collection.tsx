/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useTypedSelector from "../hooks/useTypedSelector";
import { SetCollectionAndBook } from "../interfaces";
import useSetCollectionAndBook from "../hooks/useSetCollectionAndBook";
import { connect } from "react-redux";
import {
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
} from "owc/mergeRootProps";
import { PageLoader } from "../components/LoadingIndicator";
import useNormalizedCollection from "../hooks/useNormalizedCollection";
import { ListView, LanesView } from "./BookList";
import Head from "next/head";
import PageTitle from "./PageTitle";
import { Text } from "./Text";
import BreadcrumbBar from "./BreadcrumbBar";

export const Collection: React.FC<{
  setCollectionAndBook: SetCollectionAndBook;
  title?: string;
}> = ({ setCollectionAndBook, title }) => {
  useSetCollectionAndBook(setCollectionAndBook);
  const isFetching = useTypedSelector(state => state.collection.isFetching);
  const collectionData = useNormalizedCollection();

  const hasLanes = collectionData?.lanes && collectionData.lanes.length > 0;
  const hasBooks = collectionData?.books && collectionData.books.length > 0;

  const pageTitle = title ?? `Collection: ${collectionData.title ?? ""}`;

  return (
    <div
      sx={{
        bg: "ui.gray.lightWarm",
        flex: "1 1 auto",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <BreadcrumbBar />
      <PageTitle>{pageTitle}</PageTitle>
      {isFetching ? (
        <PageLoader />
      ) : hasLanes ? (
        <LanesView lanes={collectionData.lanes ?? []} />
      ) : hasBooks ? (
        <ListView books={collectionData.books} />
      ) : (
        <div
          sx={{
            display: "flex",
            flex: "1 1 auto",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text variant="text.callouts.italic">This collection is empty.</Text>
        </div>
      )}
    </div>
  );
};

const Connected = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
)(Collection);

export default Connected;

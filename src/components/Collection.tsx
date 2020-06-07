/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import useTypedSelector from "../hooks/useTypedSelector";
import { SetCollectionAndBook } from "../interfaces";
import useSetCollectionAndBook from "../hooks/useSetCollectionAndBook";
import { connect } from "react-redux";
import {
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
} from "opds-web-client/lib/components/mergeRootProps";
import { PageLoader } from "../components/LoadingIndicator";
import useNormalizedCollection from "../hooks/useNormalizedCollection";
import { ListView, LanesView } from "./BookList";
import Head from "next/head";

export const Collection: React.FC<{
  setCollectionAndBook: SetCollectionAndBook;
}> = ({ setCollectionAndBook }) => {
  useSetCollectionAndBook(setCollectionAndBook);
  // the first hook just provides the collection, the second subs in loaned book data if existing
  const collection = useTypedSelector(state => state.collection);
  const collectionData = useNormalizedCollection();

  if (collection.isFetching) {
    return <PageLoader />;
  }

  const hasLanes = collectionData?.lanes && collectionData.lanes.length > 0;
  const hasBooks = collectionData?.books && collectionData.books.length > 0;

  if (hasBooks || hasLanes) {
    return (
      <React.Fragment>
        <Head>
          <title>{collectionData.title}</title>
        </Head>
        {hasLanes ? (
          <LanesView lanes={collectionData.lanes ?? []} />
        ) : (
          <ListView books={collectionData.books} />
        )}
      </React.Fragment>
    );
  }

  // otherwise it is empty
  return (
    <div
      sx={{
        display: "flex",
        flex: "1 1 auto",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Styled.h3 sx={{ color: "primaries.medium", fontStyle: "italic" }}>
        This collection is empty.
      </Styled.h3>
    </div>
  );
};

const Connected = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
)(Collection);

export default Connected;

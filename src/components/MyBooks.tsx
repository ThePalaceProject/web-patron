/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import useSetCollectionAndBook from "../hooks/useSetCollectionAndBook";
import { connect } from "react-redux";
import {
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
} from "opds-web-client/lib/components/mergeRootProps";
import { SetCollectionAndBook } from "../interfaces";
import useAuth from "../hooks/useAuth";
import Button from "./Button";
import Collection from "./Collection";
import useTypedSelector from "../hooks/useTypedSelector";
import { ListView } from "./BookList";
import { PageLoader } from "./LoadingIndicator";

const MyBooks: React.FC<{ setCollectionAndBook: SetCollectionAndBook }> = ({
  setCollectionAndBook
}) => {
  // here we pass in "loans" to make it look like we are at /collection/loans
  // which is what used to be the route that is now /loans (ie. this page)
  useSetCollectionAndBook(setCollectionAndBook, "loans");

  const collection = useTypedSelector(state => state.collection);
  console.log(collection);

  const { isSignedIn, signOut } = useAuth();

  if (collection.isFetching) {
    return <PageLoader />;
  }
  if (!isSignedIn)
    return (
      <div
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column"
        }}
      >
        <Styled.h4>You need to be signed in to view this page.</Styled.h4>
      </div>
    );

  if (collection.data?.books) {
    return <ListView books={collection.data?.books} />;
  }

  // otherwise you have no loans / holds
  return (
    <div
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
      }}
    >
      <Styled.h3 sx={{ color: "primaries.medium" }}>
        Your books will show up here when you have any loaned or on hold.
      </Styled.h3>
      <Button onClick={signOut}>Sign Out</Button>
    </div>
  );
};

const Connected = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
)(MyBooks);
const Wrapper = props => <Connected {...props} />;
export default Wrapper;

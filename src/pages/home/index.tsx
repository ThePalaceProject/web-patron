/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useTypedSelector from "../../hooks/useTypedSelector";
import { SetCollectionAndBook } from "../../interfaces";
import useSetCollectionAndBook from "../../hooks/useSetCollectionAndBook";
import { connect } from "react-redux";
import {
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
} from "opds-web-client/lib/components/mergeRootProps";

const Home: React.FC<{ setCollectionAndBook: SetCollectionAndBook }> = ({
  setCollectionAndBook
}) => {
  // set collection and book
  useSetCollectionAndBook(setCollectionAndBook);

  const collection = useTypedSelector(state => state.collection);
  console.log(collection);
  return <div>hi from home</div>;
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
)(Home);

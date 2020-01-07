import * as React from "react";
import { useParams } from "react-router-dom";
import useTypedSelector from "./useTypedSelector";
import { useActions } from "../components/context/ActionsContext";
import useThunkDispatch from "./useThunkDispatch";
import { findBookInCollection } from "opds-web-client/lib/components/mergeRootProps";
import { BookData, CollectionData } from "opds-web-client/lib/interfaces";

/**
 * - sets the collection and book
 * - fetches collection and book
 * - returns the required data from the store
 * - updates whenever the book or collection change
 *
 * - handles errors
 */
const useCollectionAndBook = () => {
  const actions = useActions();
  const dispatch = useThunkDispatch();
  const { bookUrl, collectionUrl } = useParams();
  const bookState = useTypedSelector(state => state.book);
  const collectionState = useTypedSelector(state => state.collection);

  const setCollection = async (): Promise<CollectionData> => {
    // if there is a url, fetch it, if not, clear the collection data
    if (collectionUrl) {
      // set the collection and fetch it
      const collectionData = await dispatch(
        actions.fetchCollection(collectionUrl)
      );
      return collectionData;
    } else {
      dispatch(actions.clearCollection());
    }
    return null;
  };

  /**
   * If you have already loaded a collection, the book can simply be
   * loaded directly from the collection. Otherwise, it needs to be fetched
   */
  const setBook = async (): Promise<BookData> => {
    if (bookUrl) {
      // first try to get book from collection
      const bookData = findBookInCollection(collectionState.data, bookUrl);
      // if that worked, load it
      if (bookData) {
        dispatch(actions.loadBook(bookData, bookUrl));
        return bookData;
      }
      // otherwise we need to fetch it
      const fetchedBook = await dispatch(actions.fetchBook(bookUrl));
      console.log(bookState);
      return fetchedBook;

      // if there is no bookUrl, then clear out the book
    } else {
      dispatch(actions.clearBook());
    }
    return null;
  };

  const setCollectionAndBook = async () => {
    const collectionData = await setCollection();
    const bookData = await setBook();
    return { collectionData, bookData };
  };

  // send redux actions in an effect and only run it when the
  // urls change
  React.useEffect(() => {
    setCollectionAndBook();
  }, [collectionUrl, bookUrl, setCollectionAndBook]);

  // handle the case where there was an error during one of the fetches
};

export default useCollectionAndBook;

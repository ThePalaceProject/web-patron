import * as React from "react";
import { useParams } from "react-router-dom";
import { SetCollectionAndBook } from "../interfaces";
import useUrlShortener from "../components/context/UrlShortenerContext";

/**
 * Currently have to pass in setCollectionAndBook, which we get from
 * redux connect using opds mapStateToProps, mapDispatchToProps and
 * mergeProps. We will look to change this in the future so this
 * hook can be entirely independent
 */
const useSetCollectionAndBook = (
  setCollectionAndBook: SetCollectionAndBook
) => {
  const { bookUrl, collectionUrl } = useParams();
  const urlShortener = useUrlShortener();

  // set the collection and book whenever the urls change
  const fullCollectionUrl = decodeURIComponent(
    urlShortener.expandCollectionUrl(collectionUrl)
  );

  const fullBookUrl = urlShortener.expandBookUrl(bookUrl);
  React.useEffect(() => {
    setCollectionAndBook(fullCollectionUrl, fullBookUrl);
    /**
     * We will explicitly not have exhaustive deps here because
     * setCollectionAndBook changes identity on every render, which
     * would cause this to be run every render. We would ideally memoize
     * setCollectionAndBook in opds-web-client, but that would require
     * significant changes. For now we will simply omit it and look out for
     * potential errors when setCollectionAndBook might be initially incorrect
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionUrl, bookUrl, fullCollectionUrl, fullBookUrl]);
};

export default useSetCollectionAndBook;

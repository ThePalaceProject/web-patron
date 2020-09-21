import * as React from "react";
import { useRouter } from "next/router";
import * as env from "utils/env";
import useLinkUtils from "components/context/LinkUtilsContext";
import useTypedSelector from "hooks/useTypedSelector";
import track from "analytics/track";

const PageviewTracker: React.FC = ({ children }) => {
  const { asPath, pathname, query } = useRouter();
  const { urlShortener } = useLinkUtils();
  const { collectionUrl, bookUrl, library } = query;
  const stringLibrary = typeof library === "string" ? library : undefined;
  const fullCollectionUrl =
    typeof collectionUrl === "string"
      ? urlShortener.expandCollectionUrl(collectionUrl)
      : undefined;
  const fullBookUrl =
    typeof bookUrl === "string"
      ? urlShortener.expandBookUrl(bookUrl)
      : undefined;

  const collectionId = useTypedSelector(state => state.collection?.data?.id);
  const collectionTitle = useTypedSelector(
    state => state.collection?.data?.title
  );
  const book = useTypedSelector(state => state.book.data);
  /**
   * We update the dataLayer whenever we change pages.
   */
  React.useEffect(() => {
    track.page({
      path: asPath,
      codePath: pathname,
      appEnvironment: env,
      library: stringLibrary,
      collectionUrl: fullCollectionUrl,
      bookUrl: fullBookUrl
    });
  }, [fullCollectionUrl, fullBookUrl, stringLibrary, asPath, pathname]);

  /**
   * Add the book and collection to data layer when they load.
   * We memoize these so the hooks only get called if the id changes.
   */
  React.useEffect(() => {
    if (book) track.bookLoaded(book);
  }, [book]);

  React.useEffect(() => {
    if (collectionId && typeof collectionUrl === "string")
      track.collectionLoaded({
        title: collectionTitle,
        id: collectionId,
        url: collectionUrl
      });
  }, [collectionUrl, collectionTitle, collectionId]);
  return <>{children}</>;
};

export default PageviewTracker;

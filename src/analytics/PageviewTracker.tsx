import * as React from "react";
import { useRouter } from "next/router";
import * as env from "utils/env";
import useLinkUtils from "components/context/LinkUtilsContext";
import { appEvent, bookEvent } from "analytics/track";
import useTypedSelector from "hooks/useTypedSelector";

const PageviewTracker: React.FC = ({ children }) => {
  const { asPath, pathname, query } = useRouter();
  const { urlShortener } = useLinkUtils();
  const { collectionUrl, bookUrl, library } = query;
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
   * We update the dataLayere whenever we change pages.
   */
  React.useEffect(() => {
    const data = {
      path: asPath,
      codePath: pathname,
      appEnvironment: env,
      library,
      collectionUrl: fullCollectionUrl,
      bookUrl: fullBookUrl
    };
    appEvent("pageview", { page: data });
  }, [fullCollectionUrl, fullBookUrl, library, asPath, pathname]);

  /**
   * Add the book and collection to data layer when they load.
   * We memoize these so the hooks only get called if the id changes.
   */
  React.useEffect(() => {
    if (book) bookEvent("book_loaded", book);
  }, [book]);

  React.useEffect(() => {
    if (collectionId && collectionUrl)
      appEvent("collection_loaded", {
        collection: {
          title: collectionTitle,
          id: collectionId,
          url: collectionUrl
        }
      });
  }, [collectionUrl, collectionTitle, collectionId]);
  return <>{children}</>;
};

export default PageviewTracker;

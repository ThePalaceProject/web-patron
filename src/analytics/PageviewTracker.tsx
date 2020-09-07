import * as React from "react";
import { useRouter } from "next/router";
import * as env from "utils/env";
import useLinkUtils from "components/context/LinkUtilsContext";
import { userEvent, appEvent } from "analytics/track";
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

  const collectionTitle = useTypedSelector(
    state => state.collection?.data?.title
  );
  const bookTitle = useTypedSelector(state => state.book.data?.title);
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
    userEvent("pageview", data);
  }, [fullCollectionUrl, fullBookUrl, library, asPath, pathname]);

  // add the book and collection titles whenever we can
  React.useEffect(() => {
    appEvent("loaded_book", {
      bookTitle
    });
  }, [bookTitle]);

  React.useEffect(() => {
    appEvent("loaded_collection", {
      collectionTitle
    });
  });
  return <>{children}</>;
};

export default PageviewTracker;

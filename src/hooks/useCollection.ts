import useLibraryContext from "components/context/LibraryContext";
import useUser from "components/context/UserContext";
import { fetchCollection } from "dataflow/opds1/fetch";
import extractParam from "dataflow/utils";
import ApplicationError from "errors";
import { CollectionData } from "interfaces";
import { useRouter } from "next/router";
import * as React from "react";
import useSWR from "swr";
import { cacheCollectionBooks } from "utils/cache";

export default function useCollection() {
  const { catalogUrl } = useLibraryContext();
  const { token } = useUser();
  const { query, pathname } = useRouter();
  const collectionUrlParam = extractParam(query, "collectionUrl") ?? null;
  // use catalog url if you're at home
  const isLibraryHome = pathname === "/[library]";
  const collectionUrl = isLibraryHome ? catalogUrl : collectionUrlParam;

  const { data: collection, error, isValidating } = useSWR<
    CollectionData,
    Error | ApplicationError
  >(collectionUrl ? [collectionUrl, token] : null, fetchCollection);

  // wrap unidentified errors in an ApplicationError
  let applicationError: ApplicationError | undefined = undefined;
  // if there is an error, but it is not an ApplicationError, wrap it in one
  // before passing it along
  if (error instanceof Error && !(error instanceof ApplicationError)) {
    applicationError = new ApplicationError(
      {
        title: "Fetch Collection Error",
        detail: "An unknown error ocurred while fetching the collection"
      },
      error
    );
  }

  // extract the books from the collection and set them in the SWR cache
  // so we don't have to refetch them when you click a book.
  React.useEffect(() => {
    cacheCollectionBooks(collection);
  }, [collection]);

  return { collection, collectionUrl, isValidating, error: applicationError };
}

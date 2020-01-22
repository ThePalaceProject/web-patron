import { usePathFor } from "opds-web-client/lib/components/context/PathForContext";
import useLibraryContext from "../components/context/LibraryContext";

/**
 * uses pathFor to construct the link to either
 * another collection or a book within the same
 * OPDS catalog. Hook version of CatalogLink in
 * opds-web-client.
 *
 * it uses the context provided catalog by default
 */
export function useGetCatalogLink(collectionUrlOverride?: string) {
  const pathFor = usePathFor();
  const library = useLibraryContext();

  // use the context provided library by default
  let collectionUrl: string;
  if (collectionUrlOverride) {
    collectionUrl = collectionUrlOverride;
  } else {
    collectionUrl = library.catalogUrl;
  }

  function getCatalogLink(bookUrl: string) {
    return pathFor(collectionUrl, bookUrl);
  }

  return getCatalogLink;
}

/**
 * Similar to the above, but simply gets the collectionUrl for a
 * provided bookUrl.
 */
function useCatalogLink(bookUrl?: string, collectionUrlOverride?: string) {
  const getCalalogLink = useGetCatalogLink(collectionUrlOverride);

  if (!bookUrl) {
    console.error(
      "You are attempting to call useCatalogLink with a nullish bookUrl"
    );
    return "";
  }

  const location = getCalalogLink(bookUrl);

  return location;
}

export default useCatalogLink;

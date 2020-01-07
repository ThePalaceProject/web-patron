import * as React from "react";
import { PathForContext } from "opds-web-client/lib/components/context/PathForContext";
import LibraryContext from "../components/context/LibraryContext";

/**
 * uses pathFor to construct the link to either
 * another collection or a book within the same
 * OPDS catalog. Hook version of CatalogLink in
 * opds-web-client.
 *
 * it uses the context provided catalog by default
 */
function useCatalogLink(bookUrl: string, collectionUrlOverride?: string) {
  const pathFor = React.useContext(PathForContext);
  const library = React.useContext(LibraryContext);

  // use the context provided library by default
  let collectionUrl: string;
  if (collectionUrlOverride) {
    collectionUrl = collectionUrlOverride;
  } else {
    collectionUrl = library.catalogUrl;
  }

  const location = pathFor(collectionUrl, bookUrl);

  return location;
}

export default useCatalogLink;

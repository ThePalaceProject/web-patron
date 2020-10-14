import useLibraryContext from "components/context/LibraryContext";
import * as React from "react";
import { LibraryData } from "interfaces";

type LinkBuilder = (url: string) => string;
type BuildMultiLibraryLink = (href: string) => string;

export type LinkUtils = {
  buildBookLink: LinkBuilder;
  buildCollectionLink: LinkBuilder;
  buildMultiLibraryLink: BuildMultiLibraryLink;
};
const LinkUtilsContext = React.createContext<LinkUtils | undefined>(undefined);

const trailingSlashRegex = /\/$/;

export const LinkUtilsProvider: React.FC<{
  library: LibraryData;
}> = ({ library, children }) => {
  const { catalogUrl } = useLibraryContext();
  const buildMultiLibraryLink: BuildMultiLibraryLink = href => {
    return `/${library.slug}${href}`.replace(trailingSlashRegex, "");
  };

  const buildCollectionLink: LinkBuilder = (collectionUrl: string) => {
    // if there is no collection url, or it is the catalog root, go home
    if (
      !collectionUrl ||
      collectionUrl.replace(trailingSlashRegex, "") === catalogUrl
    ) {
      return buildMultiLibraryLink("/");
    }
    return buildMultiLibraryLink(
      `/collection/${encodeURIComponent(collectionUrl)}`
    );
  };

  const buildBookLink: LinkBuilder = (bookUrl: string) => {
    return buildMultiLibraryLink(`/book/${encodeURIComponent(bookUrl)}`);
  };

  return (
    <LinkUtilsContext.Provider
      value={{
        buildMultiLibraryLink,
        buildBookLink,
        buildCollectionLink
      }}
    >
      {children}
    </LinkUtilsContext.Provider>
  );
};

export default function useLinkUtils() {
  const context = React.useContext(LinkUtilsContext);
  if (typeof context === "undefined") {
    throw new Error("useLinkUtils must be used within a LinkUtilsProvider");
  }
  return context;
}

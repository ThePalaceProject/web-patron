import useLibraryContext from "components/context/LibraryContext";

const trailingSlashRegex = /\/$/;

export default function useLinkUtils() {
  const { slug, catalogUrl } = useLibraryContext();

  function buildMultiLibraryLink(href: string): string {
    const fullPathname = `/${slug}${href}`.replace(trailingSlashRegex, "");
    return fullPathname;
  }

  function buildCollectionLink(collectionUrl: string) {
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
  }

  function buildBookLink(bookUrl: string) {
    return buildMultiLibraryLink(`/book/${encodeURIComponent(bookUrl)}`);
  }

  function buildReaderLink(href: string): string {
    return buildMultiLibraryLink(`/read/${encodeURIComponent(href)}`);
  }

  return {
    buildMultiLibraryLink,
    buildCollectionLink,
    buildBookLink,
    buildReaderLink
  };
}

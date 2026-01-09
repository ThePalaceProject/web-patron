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

  type ReaderType = "internal" | "external";
  function buildReaderLink(type: ReaderType, href: string): string {
    return buildMultiLibraryLink(`/read/${type}/${encodeURIComponent(href)}`);
  }

  return {
    buildMultiLibraryLink,
    buildCollectionLink,
    buildBookLink,
    buildReaderLink
  };
}

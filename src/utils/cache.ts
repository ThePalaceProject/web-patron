import { AnyBook, CollectionData } from "interfaces";
import { mutate } from "swr";

/**
 * This manages updating the SWR data cache programatically, which is sometimes desired.
 */

export async function cacheCollectionBooks(
  collection: CollectionData | undefined,
  catalogUrl: string,
  token?: string
) {
  if (!collection) return;
  await cacheBooks(collection.books, catalogUrl, token);
  await Promise.all(
    collection.lanes.map(lane => {
      return cacheBooks(lane.books, catalogUrl, token);
    })
  );
}

async function cacheBooks(
  books: AnyBook[],
  catalogUrl: string,
  token?: string
) {
  books.forEach(book => {
    mutate([book.url, catalogUrl, token], book, false);
  });
}

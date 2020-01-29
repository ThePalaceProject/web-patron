import { BookData } from "opds-web-client/lib/interfaces";

export function getAuthors(book: BookData, lim?: number): string[] {
  const allAuth = book.authors ?? book.contributors ?? ["Authors unknown"];
  // now limit it to however many
  if (lim) {
    return allAuth.slice(0, lim);
  }
  return allAuth;
}

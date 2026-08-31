import type { LibrariesResponse } from "pages/api/libraries";

export async function fetchLibraries(url: string): Promise<LibrariesResponse> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch libraries");
  return res.json();
}

/**
 * Fetches a library's authentication document from the browser and returns
 * its logo URL, or null when the document has none. The document comes from
 * a third-party server and is not schema-validated here, so the one field
 * read is type-checked instead.
 */
export async function fetchLibraryLogo(
  authDocUrl: string
): Promise<string | null> {
  const res = await fetch(authDocUrl);
  if (!res.ok) throw new Error("Failed to fetch authentication document");
  const doc: unknown = await res.json();
  const links = (doc as { links?: unknown } | null)?.links;
  const href = Array.isArray(links)
    ? (links as Array<{ rel?: unknown; href?: unknown }>).find(
        link => link?.rel === "logo"
      )?.href
    : undefined;
  return typeof href === "string" ? href.trim() || null : null;
}

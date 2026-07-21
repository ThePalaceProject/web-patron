/**
 * Appends a query parameter to an absolute URL, preserving any existing
 * query string and encoding the value.
 */
export function appendSearchParam(
  href: string,
  name: string,
  value: string
): string {
  const url = new URL(href);
  url.searchParams.set(name, value);
  return url.toString();
}

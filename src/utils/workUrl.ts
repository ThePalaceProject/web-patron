/**
 * Builds the OPDS entry URL for a work in a library's catalog. The workId is
 * percent-encoded because Next.js decodes route params, and identifiers may
 * contain characters (URN colons, encoded slashes) that must not appear raw
 * in a single path segment.
 */
export function buildWorkUrl(catalogUrl: string, workId: string): string {
  return `${catalogUrl.replace(/\/$/, "")}/works/${encodeURIComponent(workId)}`;
}

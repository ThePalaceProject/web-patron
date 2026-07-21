/**
 * Default path segment for the cross-library item landing route, served by
 * src/pages/[library]/[workId].tsx when the first path segment matches. The
 * active values (this default, or the item_landing_slugs config override) are
 * reserved: a library whose slug matches one is shadowed by the landing page.
 */
export const DEFAULT_ITEM_LANDING_SLUG = "_item_";

/**
 * First path segments that Next.js consumes before page routing reaches
 * src/pages (API routes and build assets). An item landing slug equal to one
 * of these can never serve the landing page, so colliding item_landing_slugs
 * entries are disabled with an error at config load.
 */
export const RESERVED_NEXT_SLUGS = ["api", "_next"];

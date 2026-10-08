import type { ClientLibrary } from "pages/api/libraries";

/**
 * Query parameter naming libraries to show as a promoted group on the home
 * page, by stable id or by slug.
 */
export const PROMOTE_QUERY_PARAM = "promote";
/** The promoted group's heading. Without it the localized default is used. */
export const PROMOTE_LABEL_QUERY_PARAM = "promoteLabel";
/** "name" sorts the promoted group by library name; any other value keeps link order. */
export const PROMOTE_ORDER_QUERY_PARAM = "promoteOrder";

/** The first value of a query parameter that is meaningful as a scalar. */
export function firstParamValue(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Library identifiers from a list-valued query parameter: comma-separated,
 * trimmed, empties and duplicates dropped, order preserved. A repeated
 * parameter contributes all of its values.
 */
export function parseLibraryListParam(
  value: string | string[] | undefined
): string[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  const seen = new Set<string>();
  return raw
    .split(",")
    .map(token => token.trim())
    .filter(token => {
      if (!token || seen.has(token)) return false;
      seen.add(token);
      return true;
    });
}

/**
 * The libraries the tokens name, in token order, resolved against the
 * fetched list. Each token names a library by stable id or by slug; an id
 * match wins when one value is some library's id and another library's
 * slug. Unknown tokens are ignored, and a library named more than once
 * resolves once.
 */
export function resolveLibraryList(
  tokens: string[],
  libraries: ClientLibrary[]
): ClientLibrary[] {
  const byId = new Map(libraries.map(lib => [lib.id, lib]));
  const bySlug = new Map(libraries.map(lib => [lib.slug, lib]));
  const resolved = new Set<string>();
  return tokens
    .map(token => byId.get(token) ?? bySlug.get(token))
    .filter((lib): lib is ClientLibrary => {
      if (!lib || resolved.has(lib.id)) return false;
      resolved.add(lib.id);
      return true;
    });
}

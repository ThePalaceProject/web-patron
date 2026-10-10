import type { ClientLibrary } from "pages/api/libraries";

/**
 * Query parameter naming libraries to show as a promoted group on the home
 * page, by stable id or by slug.
 */
export const PROMOTE_QUERY_PARAM = "promote";
/** The promoted group's heading. Without it the localized default is used. */
export const PROMOTE_LABEL_QUERY_PARAM = "promoteLabel";
/** The most characters of a `?promoteLabel=` heading that are shown. */
export const PROMOTE_LABEL_MAX_LENGTH = 100;
/** "name" sorts the promoted group by library name; any other value keeps link order. */
export const PROMOTE_ORDER_QUERY_PARAM = "promoteOrder";

/** The first value of a query parameter that is meaningful as a scalar. */
export function firstParamValue(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Contact details a link could plant in a page heading: a URL (with a
 * scheme, starting with "www.", a bare domain in any script, an IPv4
 * address, a bracketed IPv6 address, or "localhost" anywhere), an email
 * address with a dotted domain, or a phone number (ten or more digits, or a
 * local "555-1234" form). Short numbers such as "District 186" or
 * "2024-2025" do not match.
 */
const CONTACT_INFO_PATTERNS = [
  /[a-z][a-z\d+.-]*:\/\//i,
  /\bwww\./i,
  new RegExp(
    String.raw`(?:^|[^\p{L}\p{N}-])[\p{L}\p{N}-]+\.(?:[\p{L}\p{N}-]+\.)*\p{L}{2,}(?![\p{L}\p{N}])`,
    "u"
  ),
  /\b\d{1,3}(?:\.\d{1,3}){3}\b/,
  /\[[\da-f]*:[\da-f]*:[\da-f:.]*\]/i,
  /localhost/i,
  /[^\s@]+@[^\s@]+\.[^\s@]+/,
  /\d(?:[\s().-]*\d){9,}/,
  /\b\d{3}[\s.-]\d{4}\b/
];

/**
 * Whether the text holds a URL, email address, or phone number. The text is
 * NFKC-normalized first, so full-width forms such as "\uFF20" match too, and
 * the ideographic full stop "\u3002" counts as a dot, as it does in domain
 * names.
 */
function hasContactInfo(text: string): boolean {
  const normalized = text.normalize("NFKC").replace(/\u3002/g, ".");
  return CONTACT_INFO_PATTERNS.some(pattern => pattern.test(normalized));
}

/**
 * The promoted group's heading from a `?promoteLabel=` value: trimmed, and
 * cut to `PROMOTE_LABEL_MAX_LENGTH` characters ending in an ellipsis when
 * longer. Undefined when blank or when the label, or its cut form, holds a
 * URL, email address, or phone number. The cut form is checked separately
 * because the cut can expose contact details the full label hid, such as a
 * domain whose trailing characters made it not match.
 */
export function parsePromoteLabel(
  value: string | string[] | undefined
): string | undefined {
  const label = firstParamValue(value)?.trim() ?? "";
  if (hasContactInfo(label)) return undefined;
  const chars = Array.from(label);
  if (chars.length === 0) return undefined;
  if (chars.length <= PROMOTE_LABEL_MAX_LENGTH) return chars.join("");
  const cut = `${chars
    .slice(0, PROMOTE_LABEL_MAX_LENGTH - 1)
    .join("")
    .trimEnd()}\u2026`;
  return hasContactInfo(cut) ? undefined : cut;
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

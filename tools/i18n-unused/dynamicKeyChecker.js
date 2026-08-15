/**
 * @fileoverview A `customChecker` for i18n-unused that understands translation
 * keys assembled from template literals.
 *
 * Its default setting is too narrow:
 *
 *   t(`languageSelector.languageName.${lang.toUpperCase()}`)
 *
 * matches as literal source text, which does not contain the substring
 * "languageSelector.languageName.EN", so all four languageName keys get
 * reported as unused.
 *
 * It is also too broad for a static key, because a substring test cannot tell
 * a whole key from part of a longer one. Renaming
 * "multiLibraryHome.noLibraries" to "multiLibraryHome.noLibrariesAvailable"
 * leaves the old key matching the new key, so the old key is silently
 * treated as used.
 *
 * This checker turns each `${...}` into a single-dot-segment wildcard, so the
 * literal above becomes /^languageSelector\.languageName\.[^.]*$/ and matches
 * the EN/ES/FR/IT keys.
 *
 * Supplying `customChecker` REPLACES i18n-unused's built-in matching pass
 * entirely, so this module owns static key matching as well as dynamic.
 */

// Matches look like `t("footer.about")`, t(`a.b.${x}`) or `i18nKey="openEbooksLanding.title"`.
const KEY_LITERAL = /[`"']([^`"']+)[`"']/;

// A `${...}` interpolation
const PLACEHOLDER = /\$\{[^}]*\}/g;

// The suffix i18next appends to a plural key
const PLURAL_SUFFIX = /_(?:ordinal_)?(?:zero|one|two|few|many|other)$/;

const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Builds a pattern from a key literal, with each interpolation
 * replaced by a single-dot-segment wildcard.
 *   "a.b.${x}" -> /^a\.b\.[^.]*$/
 * @param {string} literal the key literal, interpolations included
 * @returns {RegExp} a pattern matching the keys it could produce
 */
function buildPattern(literal) {
  const source = literal.split(PLACEHOLDER).map(escapeRegExp).join("[^.]*");

  return new RegExp(`^${source}$`);
}

/**
 * The forms a call site could reference a translation key by. A plural key can
 * be reached either through the base key i18next appends the suffix to, or
 * verbatim.
 *   "utils.book.more_one" -> ["utils.book.more_one", "utils.book.more"]
 *   "footer.about"        -> ["footer.about"]
 * @param {string} key a flat translation key
 * @returns {string[]} the key, plus its base form when it is a plural key
 */
function usageForms(key) {
  const base = key.replace(PLURAL_SUFFIX, "");

  return base === key ? [key] : [key, base];
}

/**
 * Sorts a file's matcher hits into the two ways a key can be used. A hit
 * carrying no key literal, such as `t(someVariable)`, contributes to neither.
 * @param {Iterable<string>} hits matcher hits for a single source file
 * @returns {{ staticKeys: Set<string>, patterns: RegExp[] }} keys used
 *   verbatim, and one anchored pattern per dynamic hit
 */
function classifyHits(hits) {
  const staticKeys = new Set();
  const patterns = [];

  for (const hit of hits) {
    const [, literal] = hit.match(KEY_LITERAL) || [];

    if (!literal) {
      continue;
    }

    if (literal.includes("${")) {
      patterns.push(buildPattern(literal));
    } else {
      staticKeys.add(literal);
    }
  }

  return { staticKeys, patterns };
}

/**
 * Creates the `customChecker` to pass to i18n-unused.
 *
 * i18n-unused calls it once per source file and expects used keys to be
 * spliced out of `translationsKeys` in place; whatever survives every file is
 * reported as unused.
 *
 * @returns {(matchKeys: Set<string>, translationsKeys: string[]) => void}
 */
function createDynamicKeyChecker() {
  return function checkKeys(matchKeys, translationsKeys) {
    const { staticKeys, patterns } = classifyHits(matchKeys);

    // iterate backwards so splicing doesn't skip the next key
    for (let i = translationsKeys.length - 1; i >= 0; i--) {
      const key = translationsKeys[i];
      const isUsed = usageForms(key).some(
        form =>
          staticKeys.has(form) || patterns.some(pattern => pattern.test(form))
      );

      if (isUsed) {
        translationsKeys.splice(i, 1);
      }
    }
  };
}

module.exports = { createDynamicKeyChecker };

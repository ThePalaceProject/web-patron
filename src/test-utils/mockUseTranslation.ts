import enTranslations from "../../public/locales/en/translations.json";
import frTranslations from "../../public/locales/fr/translations.json";
import itTranslations from "../../public/locales/it/translations.json";
import esTranslations from "../../public/locales/es/translations.json";
import enCommon from "../../public/locales/en/common.json";
import frCommon from "../../public/locales/fr/common.json";
import itCommon from "../../public/locales/it/common.json";
import esCommon from "../../public/locales/es/common.json";

// define translation object keyed first by namespace and then by language,
// mirroring the public/locales/{language}/{namespace}.json layout on disk.
// "translations" is the default namespace, "common" holds strings shared by
// more than one component.
const translations: Record<string, Record<string, Record<string, string>>> = {
  translations: {
    en: enTranslations as Record<string, string>,
    fr: frTranslations as Record<string, string>,
    it: itTranslations as Record<string, string>,
    es: esTranslations as Record<string, string>
  },
  common: {
    en: enCommon as Record<string, string>,
    fr: frCommon as Record<string, string>,
    it: itCommon as Record<string, string>,
    es: esCommon as Record<string, string>
  }
};

// the namespace used when a t() call does not pass an `ns` option,
// matching defaultNS in next-i18next.config.js
const defaultNamespace = "translations";

let currentLanguage = "en";

// helper function that replaces placeholders
// in a translation strings with actual values.
// For example:
// - translationString: "Add {{bookTitle}} to Favorites"
// - replacement value: { bookTitle: "Moomin" }
// - result: "Add Moomin to Favorites"
function fillPlaceholders(
  translationString: string,
  replacements?: Record<string, string | number | undefined>
): string {
  // check if we have a translation and some replacements
  if (!translationString || !replacements) {
    // no string or no values
    // so just return the original text
    return translationString;
  }

  // define regular expression to find placeholders
  // this should match {{ key }} and {{key}}
  const placeholderPattern = /\{\{\s*(\w+)\s*\}\}/g;

  // replace each placeholder with the corresponding actual value from values
  return translationString.replace(
    placeholderPattern,
    (_fullMatch, placeholderKey: string) => {
      // get value for current placeholder key, for example replacements["bookTitle"]
      const replacementValue = replacements[placeholderKey];

      // check if we have a value to use as replacement
      if (replacementValue == null) {
        // no value exists after matching
        // just return the original placeholder
        return `{{${placeholderKey}}}`;
      }

      // make sure we return the value as a string
      return String(replacementValue);
    }
  );
}

// The quantifiers i18next appends to a key when a `count` option is
// passed, for example "libraryFilterList.librariesMatched_one". Which of these
// a language actually uses is decided by Intl.PluralRules.
const pluralCategories = ["zero", "one", "two", "few", "many", "other"];

// Report whether a key is present in a namespace.
// An untranslated key is stored as "" (see the note in t() below),
// and an empty value means "not translated yet", not "missing".
// Used by mockTrans to catch a renamed or orphaned i18nKey.
export const hasTranslationKey = (key: string, ns?: string): boolean => {
  const namespace = translations[ns ?? defaultNamespace];

  if (!namespace) return false;

  return Object.values(namespace).some(
    language =>
      // a plain key is stored under its own name...
      key in language ||
      // ...while a pluralised one only ever exists under its category
      // suffixes, so the bare key would otherwise read as missing.
      pluralCategories.some(category => `${key}_${category}` in language)
  );
};

// options accepted by the mock t function.
// `ns` selects the namespace and `count` selects a plural form.
type TranslationOptions = Record<string, string | number | undefined> & {
  ns?: string;
  count?: number;
};

// define mock function t to return the translation for the current language.
// The signature mirrors the i18next overload the app uses,
// t(key, defaultValue, options), and supports simple placeholder replacement,
// for example: t("addedToFavorites", "Add {{bookTitle}}", { bookTitle: "Moomin" })
const t = (
  key: string,
  defaultValue?: string,
  options?: TranslationOptions
): string => {
  // pick the namespace the caller asked for, defaulting to "translations"
  const namespace = translations[options?.ns ?? defaultNamespace] ?? {};

  // the entries for the current language within that namespace
  const language = namespace[currentLanguage] ?? {};

  // when the caller passes a count, i18next does not look the key up as
  // written. It picks a quantifier for the count in the current
  // language and appends it, so t("x", ..., { count: 1 }) reads "x_one" and
  // { count: 2 } reads "x_other". The category comes from Intl.PluralRules,
  // which is what i18next itself uses from v21 onwards, so the suffixes we
  // resolve here are exactly the ones the i18next-cli extractor writes
  const pluralCategory =
    typeof options?.count === "number"
      ? new Intl.PluralRules(currentLanguage).select(options.count)
      : undefined;
  const pluralKey = pluralCategory ? `${key}_${pluralCategory}` : undefined;

  // a caller can also spell the default out per plural category, as
  // { defaultValue_one: "...", defaultValue_other: "..." }. i18next prefers the
  // category-specific default over the plain one, so an untranslated plural key
  // still reads correctly in both forms.
  const categoryDefaultCandidate = pluralCategory
    ? options?.[`defaultValue_${pluralCategory}`]
    : undefined;
  const categoryDefaultValue =
    typeof categoryDefaultCandidate === "string"
      ? categoryDefaultCandidate
      : undefined;

  // get the translation for the key from the namespace's file for this
  // language, preferring the plural form when there is one. A pluralised key
  // has no bare entry, and a plain key has no suffixed one, so at most one of
  // these ever hits.
  const translation =
    (pluralKey ? language[pluralKey] : undefined) ?? language[key];

  // an untranslated key is stored as an empty string, and next-i18next is
  // configured with returnEmptyString: false, so an empty value falls through
  // to the default value just as it does in the app. If there is no default
  // either, fall back to the key itself.
  const translationString =
    translation || categoryDefaultValue || defaultValue || key;

  // fill placeholders like {{bookTitle}} with actual values given as parameter
  const finalTranslation = fillPlaceholders(translationString, options);

  // return the final translated string
  return finalTranslation;
};

// define mock object for the i18n instance
const i18n = {
  // getter for the current language
  get language() {
    return currentLanguage;
  },
  // function to change the current language
  changeLanguage: (newLanguage: string) => {
    currentLanguage = newLanguage;
    return Promise.resolve();
  }
};

// mock the next-i18next useTranslation hook for testing,
// returns an object with t and i18n, just like the real hook
export const mockUseTranslation = () => ({
  t,
  i18n
});

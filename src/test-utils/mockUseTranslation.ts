import enTranslations from "../../public/locales/en/translations.json";
import fiTranslations from "../../public/locales/fi/translations.json";
import svTranslations from "../../public/locales/sv/translations.json";

// define translation object
// with each supported language as property
const translations: Record<string, Record<string, string>> = {
  en: enTranslations as Record<string, string>,
  fi: fiTranslations as Record<string, string>,
  sv: svTranslations as Record<string, string>
};

// set default language for tests as English
// (we usually test with source code language)
// note: actual app default is Finnish
let currentLanguage = "en";

// helper function that replaces placeholders
// in a translation strings with actual values.
// For example:
// - translationString: "Add {{bookTitle}} to Favorites"
// - replacement value: { bookTitle: "Moomin" }
// - result: "Add Moomin to Favorites"
function fillPlaceholders(
  translationString: string,
  replacements?: Record<string, string>
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

      // make sure we returnthe value as a string
      return String(replacementValue);
    }
  );
}

// define mock function t to return the translation for the current language.
// Supports also simple placeholder replacement, for example
// if used in source code: t("addedToFavorites", { bookTitle: "Moomin" })
const t = (key: string, values?: Record<string, string>): string => {
  // get the translation for the key from the translations file,
  // or if translation is not found, use the key itself
  const translationString = translations[currentLanguage][key] ?? key;

  // fill placeholders like {{bookTitle}} with actual values given as parameter
  const finalTranslation = fillPlaceholders(translationString, values);

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

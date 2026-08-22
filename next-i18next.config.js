const path = require("path");

// define the i18n (internationalization) settings.
// Supported languages in the application
// are English, French, Italian, German, and Spanish (EFIGS order,
// which is also the order they appear in the language selector).
// The default language for the application is English,
// which is also used as the fallback language
// if a translation is missing.
const i18nConfig = {
  defaultLocale: "en",
  locales: ["en", "fr", "it", "de", "es"]
};

// define the default namespace for translations as "translations"
const defaultTranslationNamespace = "translations";

// resolve the path where translation files
// for different languages are stored.
// These files are used by the i18n library
// to provide translated content for the application.
const languageFilesPath = path.resolve("./public/locales");

// define the namespaces used for
// organizing translations in the language files.
// - "translations" is the default namespace. It holds keys used by a single
//   component, each prefixed with that component's file name.
// - "common" holds strings shared by more than one component, grouped under a
//   domain prefix (actions, auth, library, nav, status). Read them by passing
//   the namespace explicitly, for example:
//     t("actions.cancel", "Cancel", { ns: "common" })
// Every namespace listed here must also be listed in TRANSLATION_NAMESPACES in
// src/dataflow/translationProps.ts, or its keys never reach the client.
const translationNamespaces = ["translations", "common"];

// create the configuration object for next-i18next.
// keySeparator:
// - do not split keys on '.', keep flat JSON without nesting
//   for example "bookDetail.publisher" is treated as a single key
// reloadOnPrerender:
//  - on dev mode developers can see changes
//    made to the translations without restarting the server
const nextI18NextConfig = {
  i18n: i18nConfig,
  defaultNS: defaultTranslationNamespace,
  keySeparator: false,
  localePath: languageFilesPath,
  ns: translationNamespaces,
  reloadOnPrerender: process.env.NODE_ENV === "development",
  returnEmptyString: false // uses the default value from translation function (second argument) if key in translation is an empty string ("")
};

// export the configuration
module.exports = nextI18NextConfig;

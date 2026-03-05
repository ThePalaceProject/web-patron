// next-i18next.config.js file contains
// the configuration for the next-i18next library,
// which manages translations (internationalization)
// in the E-kirjasto Next.js app

// first import the Node path helper to handle file paths
const path = require("path");

// define the i18n (internationalization) settings.
// Supported languages in the application
// are Finnish, English, and Swedish.
// The default language for the application is Finnish,
// which is also used as the fallback language
// if a translation is missing.
const i18nConfig = {
  defaultLocale: "fi",
  locales: ["fi", "sv", "en"]
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
// In E-kirjasto app, the "translations" namespace contains all the
// translations used throughout the app,
// and no additional namespaces are currently used.
const translationNamespaces = ["translations"];

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
  reloadOnPrerender: process.env.NODE_ENV === "development"
};

// export the configuration
module.exports = nextI18NextConfig;

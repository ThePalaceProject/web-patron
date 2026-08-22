// i18next.config.ts configures the i18next-cli command line tool
// for managing translations in the app.
// We define how to
// - extract the translation keys from the source code
// - setup the translation files
// Use i18next-cli with these scripts
//
// translations:status
//    => get an overview of project translations
//
// translations:lint
//    => print a list of hardcoded strings that need to be translated
//
// translations:extract
//    => extract translation keys from the code and update the translation files
//
// translations:sync
//    => sync non-English files against en file (add missing keys and purge extra ones)
//    => caveat: translations:sync will strip empty locale-specific plural forms (e.g. `_many`)
//    => when such forms are missing from en (due to locale-specific differences in pluralization)
//
// translations:ci
//    =>  fails builds when translations are outdated, used for CI purposes
//    (does a dry run of the extraction process without making any changes)

// import helper function to create the configuration
import { defineConfig } from "i18next-cli";

// define the supported languages
// the app has five languages in EFIGS order:
// English, French, Italian, German, and Spanish
const appLocales = ["en", "fr", "it", "de", "es"];

// set the primary language for the application
// English translations and keys are the "base" for other translations
const primaryLanguage = "en";

// define secondary languages that will be supported: French, Italian, German, and Spanish
const secondaryLanguages = ["fr", "it", "de", "es"];

// define the functions used for translation in the code
// t function is used for retrieving translation strings
const translationFunctions = ["t"];

// define the default namespace (file) for translations as "translations"
const defaultTranslationNamespace = "translations";

// define the input file patterns to search for translation keys
// We include all files anywhere in src, rather than naming individual directories,
// so a directory that gains translated components cannot silently fall out of extraction
// We also include .ts files as some utilities and hooks pass strings to components
const inputFiles = ["src/**/*.{tsx,jsx,ts}"];

// define the output path to public/locales directory,
// and organize the translation files by language and namespace,
// for example public/locales/en/translations.json
const outputPath = "public/locales/{{language}}/{{namespace}}.json";

// define files and directories to ignore during extraction
// Test files are skipped, as are the shared test helpers in src/test-utils,
// which reference the translation API but hold no keys of their own
const ignoredFiles = [
  "**/__tests__/**",
  "src/test-utils/**",
  "**/*.stories.tsx"
];

// define list of HTML attributes to ignore during extraction,
// these attributes do not need to be translated
const ignoredAttributes = [
  "aria-describedby",
  "aria-live",
  "as",
  "backgroundColor",
  "color",
  "content",
  "d",
  "data-testid",
  "direction",
  "fill",
  "flexDirection",
  "htmlFor",
  "id",
  "lang",
  "name",
  "rel",
  "role",
  "variant",
  "viewBox",
  "width"
];

// create the extraction configuration object.
// Some notes:
// - keySeparator: false => treat all keys as flat (do not split on '.')
//   for example "bookDetails.publisher" is one key
// - removeUnusedKeys: false => we should only remove keys manually
//   from translation.json files, so no automatic purging
//   during extraction to prevent key loss
// - sort: true => translation keys are automatically
//    sorted alphabetically in translation.json files after extraction
const extractConfig = {
  defaultNS: defaultTranslationNamespace,
  functions: translationFunctions,
  ignore: ignoredFiles,
  ignoredAttributes,
  input: inputFiles,
  keySeparator: false as const, // do not change!
  output: outputPath,
  primaryLanguage,
  removeUnusedKeys: false, // do not change!
  secondaryLanguages,
  sort: true // do not change!
};

// create configuration object for i18next-cli
// with supported locales and the extraction rules
// and then export the configuration
export default defineConfig({
  locales: appLocales,
  extract: extractConfig
});

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
//    => sync fi and sv files against en file (add missing keys and purge extra ones)
//
// translations:ci
//    =>  fails builds when translations are outdated, used for CI purposes
//    (does a dry run of the extraction process without making any changes)

// import helper function to create the configuration
import { defineConfig } from "i18next-cli";

// define the supported languages
// E-kirjasto app has three languages: English, Finnish, Swedish
const appLocales = ["fi", "sv", "en"];

// set the primary, "main" language for the application
// English translations and keys are the "base" for other translations
const primaryLanguage = "en";

// define secondary languages that will be supported: Finnish and Swedish
const secondaryLanguages = ["fi", "sv"];

// define the functions used for translation in the code
// t function is used for retrieving translation strings
const translationFunctions = ["t"];

// define the default namespace (file) for translations as "translations"
const defaultTranslationNamespace = "translations";

// define the input file patterns to search for translation keys
// We include all .tsx and .jsx files in the components and pages directories
const inputFiles = ["src/{components,pages}/**/*.{tsx,jsx}"];

// define the output path to public/locales directory,
// and organise the translation files by language and namespace,
// for example public/locales/fi/translations.json
const outputPath = "public/locales/{{language}}/{{namespace}}.json";

// define files and directories to ignore during extraction
// For example test files are skipped
const ignoredFiles = ["**/__tests__/**"];

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

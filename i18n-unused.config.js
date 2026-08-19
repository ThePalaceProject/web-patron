const {
  createDynamicKeyChecker
} = require("./tools/i18n-unused/dynamicKeyChecker");

module.exports = {
  localesPath: "public/locales",
  srcPath: "src",

  // i18n-unused strips a plural/context suffix off each key before matching,
  // but getKeyWithoutContext drops two underscore-separated parts instead of
  // one, so a two-part key collapses to "".
  // E.g. "utils.book.authors_one" splits to ["utils.book.authors", "one"], and slice(0, length - 2) is [].
  // Every plural key in a file collapses to the same "", which is then deduped to a single
  // phantom unused key and the real ones are hidden from the checker entirely.
  // Turning this off keeps the raw keys; dynamicKeyChecker.js strips the suffix itself.
  context: false,

  // Replaces the built-in matching pass so keys built from template literals,
  // e.g. t(`languageSelector.languageName.${lang.toUpperCase()}`), are not
  // reported as unused. See tools/i18n-unused/dynamicKeyChecker.js.
  customChecker: createDynamicKeyChecker(),

  // public/locales/*/translations.json is flat: every key is a dotted string
  // and there are no nested objects, because next-i18next.config.js sets
  // keySeparator: false. Without this flag `remove-unused` and `mark-unused`
  // split keys on "." and rewrite the files into nested objects.
  // display-unused is unaffected either way.
  flatTranslations: true

  // NOTE: no ignorePaths, so src/**/__tests__/** counts as usage — a key
  // referenced only from a test will not be reported. i18next.config.ts
  // ignores those files; i18n-unused matches ignorePaths by literal prefix
  // rather than glob, so there is no concise way to express the same thing.
};

// define enums that match the Next.js i18n locales
export enum Language {
  EN = "en",
  FR = "fr",
  IT = "it",
  ES = "es"
}

// helper function (type guard) that checks
// if a locale is a valid Language
// for example "de" is not a valid language code in our app
export function isLanguage(locale: string | undefined): locale is Language {
  return (
    locale === Language.EN ||
    locale === Language.FR ||
    locale === Language.IT ||
    locale === Language.ES
  );
}

// define enums that match the Next.js i18n locales
// NOTE: declaration order is user-visible. LanguageSelector renders
// Object.values(Language) in this order, so changing it reorders the dropdown.
// The order is EFIGS — English, French, Italian, German, Spanish.
export enum Language {
  EN = "en",
  FR = "fr",
  IT = "it",
  DE = "de",
  ES = "es"
}

// helper function (type guard) that checks
// if a locale is a valid Language
// for example "pt" is not a valid language code in our app
export function isLanguage(locale: string | undefined): locale is Language {
  return (
    locale === Language.EN ||
    locale === Language.FR ||
    locale === Language.IT ||
    locale === Language.DE ||
    locale === Language.ES
  );
}

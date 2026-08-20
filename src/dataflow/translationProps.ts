import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import nextI18NextConfig from "../../next-i18next.config";

// define the translation file namespaces, mirroring `ns` in
// next-i18next.config.js. Both must be listed here, or the omitted namespace
// never reaches the client and its keys silently fall back to their English
// defaultValue.
const TRANSLATION_NAMESPACES = ["translations", "common"];

/*
 * Builds the props next-i18next needs on the client. appWithTranslation only
 * creates an i18next instance when pageProps contains _nextI18Next, so every
 * page's getStaticProps/getServerSideProps — including error and fallback
 * branches — must spread this into its props. Without it useTranslation logs
 * NO_I18NEXT_INSTANCE and every string falls back to its English defaultValue.
 */
export async function getTranslationProps(locale: string | undefined) {
  // use the locale from context, or if it is missing, the app's default locale
  const currentLocale = locale ?? "en";

  /*
   * Pass the config explicitly. Left to itself, next-i18next resolves
   * next-i18next.config.js against the working directory at request time,
   * which is the standalone bundle directory in a production build and does
   * not contain the file.
   */
  return {
    _locale: currentLocale,
    ...(await serverSideTranslations(
      currentLocale,
      TRANSLATION_NAMESPACES,
      nextI18NextConfig
    ))
  };
}

import { useRouter } from "next/router";
import { isLanguage, Language } from "utils/i18n";

/**
 * The current Next.js locale, narrowed to a Language the app supports.
 *
 * Falls back to English for a missing or unsupported locale, so callers can
 * pass the result straight to Intl without another guard. Components that
 * need to distinguish "unsupported" from "English" (LanguageSelector) should
 * read router.locale directly instead.
 */
export default function useLocale(): Language {
  const router = useRouter();
  return isLanguage(router?.locale) ? router.locale : Language.EN;
}

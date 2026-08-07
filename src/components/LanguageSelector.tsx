import { useRouter } from "next/router";
import { useTranslation } from "next-i18next/pages";
import React from "react";
import {
  Select,
  SelectArrow,
  SelectItem,
  SelectPopover,
  useSelectContext,
  useSelectStore,
  useStoreState
} from "@ariakit/react";
import { styleProps } from "./Button/styles";
import { lightness } from "@theme-ui/color";
import track from "analytics/track";
import Cookie from "js-cookie";

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
function isLanguage(locale: string | undefined): locale is Language {
  return (
    locale === Language.EN ||
    locale === Language.FR ||
    locale === Language.IT ||
    locale === Language.ES
  );
}

/**
 * Persist the chosen language so Next.js can restore it on a return visit.
 * Next reads this cookie during automatic locale detection and prefers it
 * over the browser's Accept-Language header.
 * NOTE: Only works when user navigates to root "/" path.
 */
function setLocaleCookie(locale: Language) {
  Cookie.set("NEXT_LOCALE", locale, {
    expires: 365,
    path: "/",
    sameSite: "lax",
    // only mark Secure over HTTPS; a Secure cookie is dropped on http://localhost
    secure: window.location.protocol === "https:"
  });
}

const LanguageSelectItem: React.FC<{ lang: Language }> = ({ lang }) => {
  const { t } = useTranslation();
  const store = useSelectContext();
  const activeId = useStoreState(store, "activeId");
  const id = `language-option-${lang}`;
  const isActive = activeId === id;

  return (
    <SelectItem
      id={id}
      value={lang}
      sx={{
        ...styleProps("ui.black", "md", "ghost"),
        fontWeight: "normal",
        justifyContent: "flex-start",
        ...(isActive && {
          bg: lightness("ui.black", 0.9)
        })
      }}
    >
      {t(`languageName.${lang.toUpperCase()}`)} ({lang})
    </SelectItem>
  );
};

const LanguageSelector: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation();
  const router = useRouter();

  // get the current locale from router,
  // and make sure it's a valid language we want to use
  const currentLocale: Language | undefined = isLanguage(router.locale)
    ? router.locale
    : undefined;

  const handleLanguageChange = (value: string) => {
    const language = value as Language;
    // first check if the selected language is the current locale
    if (currentLocale === language) {
      // nothing to change, languages are the same
      // just return and do nothing
      return;
    }

    // remember the choice so it survives to future visits
    setLocaleCookie(language);

    // change the language:
    // - update the URL and reload the page with the selected language
    router
      // try to push the same path to the router with a new locale
      .push(router.asPath, router.asPath, { locale: language })
      .catch(error => {
        track.error(error, {
          severity: "error",
          metadata: {
            "Router Info": {
              asPath: router.asPath,
              locale: language
            }
          }
        });
      });
  };

  // create the select store manually (instead of using SelectProvider)
  // so this component can close the dropdown programmatically
  const selectStore = useSelectStore({
    focusLoop: true,
    value: currentLocale,
    setValue: handleLanguageChange
  });

  /**
   * Close the dropdown when the Escape key is pressed.
   * When Firefox is full screen, its default behavior for Escape is to exit full-screen mode.
   * This conflicts with the expected behavior of keyboard navigation closing modals/dialogs/menus
   * when pressing the Escape key.
   * Ariakit skips its own Escape handling once preventDefault has been
   * called, so the dropdown must also be closed manually.
   */
  const handlePopoverKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      selectStore.hide();
    }
  };

  // - locale could be invalid, if unsupported language like "de" is used
  if (!currentLocale) {
    return null;
  }

  return (
    <>
      <Select
        store={selectStore}
        aria-label={t("languageSelector")}
        className={className}
        sx={{
          ...styleProps("ui.black", "md", "outlined"),
          paddingRight: "6px",
          paddingLeft: "6px"
        }}
      >
        {t(`languageName.${currentLocale.toUpperCase()}`)} ({currentLocale})
        <SelectArrow />
      </Select>
      <SelectPopover
        store={selectStore}
        gutter={8}
        onKeyDown={handlePopoverKeyDown}
        sx={{
          backgroundColor: "white",
          cursor: "pointer",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "ui.gray.light",
          padding: "8px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {Object.values(Language).map(lang => (
          <LanguageSelectItem key={lang} lang={lang} />
        ))}
      </SelectPopover>
    </>
  );
};

export default LanguageSelector;

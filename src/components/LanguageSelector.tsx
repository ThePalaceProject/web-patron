/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "theme-ui";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import Button from "components/Button";
import React from "react";
import Stack from "components/Stack";

// define enums that match the Next.js i18n locales
export enum Language {
  FI = "fi",
  SV = "sv",
  EN = "en"
}

// define style for the language selector stack
// (the container for language buttons)
const stackStyle = {
  alignItems: "center",
  backgroundColor: "ui.ekirjastogreen",
  borderRadius: "30px",
  fontSize: "12px",
  height: "32px",
  justifyContent: "space-around",
  padding: "5px"
};

// define base style for a language button
const buttonBaseStyle = {
  border: "none",
  borderRadius: "20px",
  fontSize: "12px",
  height: "22px",
  margin: "0 5px",
  transition: "background-color 0.3s, color 0.3s, transform 0.3s"
};

// function that returns the final style for a button
// based on if it is selected or not
const getButtonStyle = (isSelected: boolean) => ({
  ...buttonBaseStyle, // spread base style first
  backgroundColor: isSelected ? "ui.white" : "ui.ekirjastogreen",
  color: isSelected ? "ui.black" : "ui.white",
  fontWeight: isSelected ? "bold" : "normal",
  "&:focus": {
    color: isSelected ? "ui.black" : "ui.white",
    backgroundColor: isSelected ? "ui.white" : "ui.ekirjastogreen",
    outline: "2px solid #005a5d",
    outlineOffset: "2px"
  }
});

// props interface for LanguageSelector component
interface LanguageSelectorProps {
  // no properties for this component yet
}

// helper function (type guard) that checks
// if a locale is a valid Language
// for example "de" is not a valid language code in our app
function isLanguage(locale: string | undefined): locale is Language {
  return (
    locale === Language.FI || locale === Language.SV || locale === Language.EN
  );
}

// main LanguageSelector component
const LanguageSelector: React.FC<LanguageSelectorProps> = () => {
  // get translation function t from the useTranslation hook,
  // used for fetching localized strings for current language
  const { t } = useTranslation();

  // get router instance from Next.js,
  // used for reading the current locale and changing the language in the URL
  const router = useRouter();

  // get the current locale from router,
  // and make sure it's a valid language we want to use
  const currentLocale: Language | undefined = isLanguage(router.locale)
    ? router.locale
    : undefined;

  // function that handled language change
  const handleLanguageChange = (language: Language) => {
    // first check if the selected language is the current locale
    if (currentLocale === language) {
      // nothing to change, languages are the same
      // just return and do nothing
      return;
    }

    // change the language:
    // - update the URL and reload the page with the selected language
    router
      // try to push the same path to the router with a new locale
      .push(router.asPath, router.asPath, { locale: language })
      .catch(error => {
        // if navigation fails, just console log error
        console.error("Failed to change language", error);
      });
  };

  // function that renders a single language button
  // we give unique key for each button
  const renderLanguageButton = (language: Language) => {
    // first check if this language is currently selected
    const isSelected = currentLocale === language;
    const buttonLabel = language.toUpperCase();

    // create translation keys for aria-label:
    // - languageName.FI
    // - languageName.SV
    // - languageName.EN
    const ariaLabel = t(`languageName.${language.toUpperCase()}`);

    return (
      // render one language button
      <Button
        key={language}
        aria-label={ariaLabel}
        aria-current={isSelected ? "true" : undefined}
        onClick={() => handleLanguageChange(language)}
        sx={getButtonStyle(isSelected)}
      >
        {buttonLabel}
      </Button>
    );
  };

  // checks if the component should be rendered.
  // Examples when not to render:
  // - routing might not be complete when navigating to a new page
  // - locale could be invalid, if unsupported language like "de" is used
  const shouldRenderSelector: boolean = router.isReady && !!currentLocale;

  return (
    // render the language selector capsule
    // containing buttons for FI, SV and EN
    <>
      {shouldRenderSelector && (
        <Stack role="group" sx={stackStyle} aria-label={t("languageSelector")}>
          {renderLanguageButton(Language.FI)}
          {renderLanguageButton(Language.SV)}
          {renderLanguageButton(Language.EN)}
        </Stack>
      )}
    </>
  );
};

export default LanguageSelector;

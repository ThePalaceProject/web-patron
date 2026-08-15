/*
 * Covers the config override passed to appWithTranslation in _app.tsx.
 *
 * Without it, appWithTranslation returns a null i18n instance for any render
 * whose pageProps carry no _nextI18Next, mounting no provider and dropping every
 * string back to its English defaultValue. That happens on one real path: Next
 * renders _error client-side when an in-app navigation's data fetch throws, and
 * _error may only use getInitialProps, which cannot read the locale files in the
 * browser.
 *
 * These tests use the real next-i18next rather than the module mock in
 * src/test-utils/index.tsx, since the behaviour under test lives in
 * appWithTranslation itself.
 */
jest.unmock("next-i18next/pages");

import * as React from "react";
import { render, screen } from "@testing-library/react";
import { appWithTranslation, useTranslation } from "next-i18next/pages";
import nextI18NextConfig from "../../../next-i18next.config";
// Imported directly rather than through the test-utils barrel, which would
// re-register the next-i18next/pages mock this file unmocks above.
import { expectAndSuppressConsole } from "test-utils/suppressConsole";

// i18next defers its init callback with setTimeout, which the globally enabled
// fake timers would never fire.
jest.useRealTimers();

const FRENCH_DETAIL = "Une erreur inattendue s'est produite.";

const Child = () => {
  const { t } = useTranslation();
  return (
    <div data-testid="detail">
      {t("error.unexpectedError", "An unexpected error occurred.", {
        ns: "common"
      })}
    </div>
  );
};

const App = ({ Component }: any) => <Component />;

const frPageProps = {
  _nextI18Next: {
    initialI18nStore: {
      fr: { common: { "error.unexpectedError": FRENCH_DETAIL } }
    },
    initialLocale: "fr",
    ns: ["translations", "common"],
    userConfig: nextI18NextConfig
  }
};

/*
 * Renders a normal page that ships translation props, then re-renders with none
 * at all — the client-side _error case — and reports what the child resolves to.
 */
async function renderThenDropTranslationProps(Wrapped: any) {
  const { rerender } = render(
    <Wrapped
      Component={Child}
      pageProps={frPageProps}
      router={{ locale: "fr" }}
    />
  );
  expect(await screen.findByText(FRENCH_DETAIL)).toBeInTheDocument();

  rerender(
    <Wrapped Component={Child} pageProps={{}} router={{ locale: "fr" }} />
  );
  return screen.getByTestId("detail").textContent;
}

describe("appWithTranslation config override", () => {
  test("keeps the locale when a render ships no translation props", async () => {
    const Wrapped = appWithTranslation(App, nextI18NextConfig as any);

    expect(await renderThenDropTranslationProps(Wrapped)).toBe(FRENCH_DETAIL);
  });

  test("falls back to English without the override", async () => {
    /*
     * The missing override is what leaves appWithTranslation with a null i18n
     * instance, so react-i18next warns that no provider is mounted.
     * This is expected; suppressing to reduce noise in tests.
     */
    const warnSpy = expectAndSuppressConsole(
      "warn",
      "useTranslation: You will need to pass in an i18next instance"
    );
    const Wrapped = appWithTranslation(App);

    expect(await renderThenDropTranslationProps(Wrapped)).toBe(
      "An unexpected error occurred."
    );
    expect(warnSpy).toHaveBeenCalled();
  });
});

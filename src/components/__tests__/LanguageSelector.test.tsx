import { mockUseTranslation } from "test-utils/mockUseTranslation";
import { screen, setup as customSetup } from "test-utils";
import LanguageSelector, { Language } from "components/LanguageSelector";
import React from "react";
// resolves to the stateful mock in __mocks__/js-cookie.ts,
// which test-utils resets before each test
import mockCookie from "js-cookie";

// mock the next/router first
// to prevent tests using the actual router
jest.mock("next/router", () => ({
  // define mock for the useRouter hook
  useRouter: jest.fn()
}));

// helper function to mock next/router with specific parameters
const mockRouter = (locale: string) => {
  // define mock implementation of the push function
  const push = jest.fn(() => Promise.resolve());

  // define the return value for the useRouter mock
  // this allows tests to specify the current locale and readiness state
  (require("next/router").useRouter as jest.Mock).mockReturnValue({
    locale,
    asPath: "/test",
    push
  });

  // return the mocked push function for assertions in tests
  return push;
};

// define helper function to set up the test environment
const setup = (locale: string) => {
  // first mock the router
  const push = mockRouter(locale);

  // change language using the mock translation function
  mockUseTranslation().i18n.changeLanguage(locale);

  // then render the component
  const { user } = customSetup(<LanguageSelector />);

  // return the mocked push function
  // so we can check it in tests if needed
  return { push, user };
};

describe("LanguageSelector", () => {
  beforeEach(() => {
    // use setup with your chosen language
    // at the start of each test.
  });

  it.each([
    [Language.EN, "Choose language"],
    [Language.ES, "Seleccionar idioma"],
    [Language.FR, "Choisir la langue"],
    [Language.IT, "Scegli la lingua"]
  ])(
    "should show correct aria-label when locale is %s",
    (locale, ariaLabel) => {
      setup(locale);
      // select should have correct translated aria-label
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-label",
        ariaLabel
      );
    }
  );

  it("should show the current language in the select button", () => {
    setup(Language.EN);

    // the select button should show the current language name and code
    expect(screen.getByRole("combobox")).toHaveTextContent("English (en)");
  });

  it("should render language options", async () => {
    const { user } = setup(Language.EN);
    await user.click(screen.getByRole("combobox"));

    const options = screen.getAllByRole("option");

    // there should be exactly four options
    expect(options).toHaveLength(4);

    // there should be an EN, FR, IT and ES option,
    // and the order of options should be EN, FR, IT, ES
    expect(options[0]).toHaveTextContent("English (en)");
    expect(options[1]).toHaveTextContent("French (fr)");
    expect(options[2]).toHaveTextContent("Italian (it)");
    expect(options[3]).toHaveTextContent("Spanish (es)");
  });

  // define test case table
  // that creates a test case for each language
  it.each`
    locale         | optionNames
    ${Language.EN} | ${["English (en)", "French (fr)", "Italian (it)", "Spanish (es)"]}
    ${Language.ES} | ${["Inglés (en)", "Francés (fr)", "Italiano (it)", "Español (es)"]}
    ${Language.FR} | ${["Anglais (en)", "Français (fr)", "Italien (it)", "Espagnol (es)"]}
    ${Language.IT} | ${["Inglese (en)", "Francese (fr)", "Italiano (it)", "Spagnolo (es)"]}
  `(
    "should render correct accessible names for options in $locale",
    async ({ locale, optionNames }) => {
      const { user } = setup(locale);
      await user.click(screen.getByRole("combobox"));

      optionNames.forEach((optionName: string) =>
        // each option should have a translated accessible name
        expect(
          screen.getByRole("option", { name: optionName })
        ).toBeInTheDocument()
      );
    }
  );

  it("should select the current language", async () => {
    const { user } = setup(Language.FR);
    await user.click(screen.getByRole("combobox"));

    // only the FR option should be marked as selected
    expect(
      screen.getByRole("option", { name: "Anglais (en)" })
    ).toHaveAttribute("aria-selected", "false");
    expect(
      screen.getByRole("option", { name: "Français (fr)" })
    ).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByRole("option", { name: "Italien (it)" })
    ).toHaveAttribute("aria-selected", "false");
    expect(
      screen.getByRole("option", { name: "Espagnol (es)" })
    ).toHaveAttribute("aria-selected", "false");
  });

  it("should call router.push with correct locale when changing language", async () => {
    const { push, user } = setup(Language.EN);
    await user.click(screen.getByRole("combobox"));

    await user.click(screen.getByRole("option", { name: "Spanish (es)" }));

    // should call router.push with Spanish
    expect(push).toHaveBeenCalledWith("/test", "/test", {
      locale: Language.ES
    });
  });

  it("should not call router.push when selecting the current language", async () => {
    const { push, user } = setup(Language.ES);
    await user.click(screen.getByRole("combobox"));

    await user.click(screen.getByRole("option", { name: "Español (es)" }));

    // should not call router.push because Spanish is already locale
    expect(push).not.toHaveBeenCalled();
  });

  it("should set the NEXT_LOCALE cookie when changing language", async () => {
    const { user } = setup(Language.EN);
    await user.click(screen.getByRole("combobox"));

    await user.click(screen.getByRole("option", { name: "Spanish (es)" }));

    // should persist the choice so Next.js can restore it on a return visit.
    // "secure" is left out of the assertion because it depends on the
    // protocol of the environment the test runs in.
    expect(mockCookie.set).toHaveBeenCalledWith(
      "NEXT_LOCALE",
      Language.ES,
      expect.objectContaining({
        expires: 365,
        path: "/",
        sameSite: "lax"
      })
    );
    expect(mockCookie.get("NEXT_LOCALE")).toBe(Language.ES);
  });

  it("should not set the NEXT_LOCALE cookie when selecting the current language", async () => {
    const { user } = setup(Language.ES);
    await user.click(screen.getByRole("combobox"));

    await user.click(screen.getByRole("option", { name: "Español (es)" }));

    // nothing changed, so the existing cookie should be left alone
    expect(mockCookie.set).not.toHaveBeenCalled();
  });

  it("should not render selector if locale is invalid", () => {
    // setup using unsupported language
    setup("de");

    // should not find language selector
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});

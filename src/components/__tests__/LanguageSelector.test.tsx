import { mockUseTranslation } from "test-utils/mockUseTranslation";
import { render, screen, fireEvent } from "test-utils";
import LanguageSelector, { Language } from "components/LanguageSelector";
import React from "react";

// mock the next/router first
// to prevent tests using the actual router
jest.mock("next/router", () => ({
  // define mock for the useRouter hook
  useRouter: jest.fn()
}));

// helper function to mock next/router with specific parameters
const mockRouter = (locale: string, isReady = true) => {
  // define mock implementation of the push function
  const push = jest.fn(() => Promise.resolve());

  // define the return value for the useRouter mock
  // this allows tests to specify the current locale and readiness state
  (require("next/router").useRouter as jest.Mock).mockReturnValue({
    locale,
    isReady,
    asPath: "/test",
    push
  });

  // return the mocked push function for assertions in tests
  return push;
};

// define helper function to set up the test enviroment
const setup = (locale: string, isReady = true) => {
  // fist mock the router
  const push = mockRouter(locale, isReady);

  // change language using the mock translation function
  mockUseTranslation().i18n.changeLanguage(locale);

  // then render the component
  render(<LanguageSelector />);

  // return the mocked push function
  // so we can check it in tests if needed
  return { push };
};

describe("LanguageSelector", () => {
  beforeEach(() => {
    // use setup with your chosen language
    // at the start of each test.
  });

  it.each([
    [Language.FI, "Valitse sivun kieli"],
    [Language.SV, "Välj sidspråk"],
    [Language.EN, "Select page language"]
  ])(
    "should show correct aria-label when locale is %s",
    (locale, ariaLabel) => {
      setup(locale);
      // stack should have correct translated aria-label
      expect(screen.getByRole("group")).toHaveAttribute(
        "aria-label",
        ariaLabel
      );
    }
  );

  it("should render language buttons", () => {
    setup(Language.FI);
    const buttons = screen.getAllByRole("button");

    // there should be exactly three buttons
    expect(buttons).toHaveLength(3);

    // there should be a FI, SV and EN button
    expect(screen.getByText("FI")).toBeInTheDocument();
    expect(screen.getByText("SV")).toBeInTheDocument();
    expect(screen.getByText("EN")).toBeInTheDocument();

    // the order of buttons should be FI, SV, EN
    expect(buttons[0]).toHaveTextContent("FI");
    expect(buttons[1]).toHaveTextContent("SV");
    expect(buttons[2]).toHaveTextContent("EN");
  });

  // define test case table
  // that creates three tests cases for each language
  it.each`
    locale         | ariaLabels
    ${Language.FI} | ${["Suomi", "Ruotsi", "Englanti"]}
    ${Language.EN} | ${["Finnish", "Swedish", "English"]}
    ${Language.SV} | ${["Finska", "Svenska", "Engelska"]}
  `(
    "should render correct accessible names for button in $langCode",
    ({ locale, ariaLabels }) => {
      setup(locale);

      ariaLabels.forEach(ariaLabel =>
        // each button should have translated aria-labels
        expect(
          screen.getByRole("button", { name: ariaLabel })
        ).toBeInTheDocument()
      );
    }
  );

  it("should select the current language", () => {
    setup(Language.SV);

    // SV button should be selected
    expect(screen.getByText("FI")).not.toHaveAttribute("aria-current");
    expect(screen.getByText("SV")).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("EN")).not.toHaveAttribute("aria-current");
  });

  it("should call router.push with correct locale when changing language", () => {
    const { push } = setup(Language.FI);

    fireEvent.click(screen.getByText("SV"));

    // should call router.push with Swedish
    expect(push).toHaveBeenCalledWith("/test", "/test", {
      locale: Language.SV
    });
  });

  it("should not call router.push when clicking the current language", () => {
    const { push } = setup(Language.SV);

    fireEvent.click(screen.getByText("SV"));

    // should not call router.push because Swedish is already locale
    expect(push).not.toHaveBeenCalled();
  });

  it("should not render selector if locale is invalid", () => {
    // setup using unsupported language
    setup("de");

    // should not find language selector
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
  });

  it("should not render selector if router is not ready", () => {
    // setup using unready router
    setup(Language.FI, false);

    // should not find language selector
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
  });
});

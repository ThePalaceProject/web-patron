/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from "test-utils";
import MultiLibraryLandingPageHeader from "./MultiLibraryLandingPageHeader";

describe("LanguageSelector", () => {
  it("displays when enabled in appConfig", async () => {
    render(<MultiLibraryLandingPageHeader heading="My Library" />, {
      appConfig: { enableLanguageSelector: true }
    });

    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: "Choose language" })
      ).toBeInTheDocument();
    });
  });

  it("does not display when disabled in appConfig", async () => {
    render(<MultiLibraryLandingPageHeader heading="My Library" />, {
      appConfig: { enableLanguageSelector: false }
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("combobox", { name: "Choose language" })
      ).not.toBeInTheDocument();
    });
  });
});

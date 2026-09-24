import * as React from "react";
import { render, screen, waitFor } from "../../test-utils";
import { OpenEbooksLandingComponent } from "components/OpenEbooksLanding";

test("renders", () => {
  render(<OpenEbooksLandingComponent />);
  expect(
    screen.getByRole("heading", {
      name: "Welcome to Open eBooks"
    })
  ).toBeInTheDocument();
});

describe("LanguageSelector", () => {
  it("displays when enabled in appConfig", () => {
    render(<OpenEbooksLandingComponent />, {
      appConfig: { enableLanguageSelector: true }
    });

    waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: "Choose language" })
      ).toBeInTheDocument();
    });
  });

  it("does not display when disabled in appConfig", () => {
    render(<OpenEbooksLandingComponent />, {
      appConfig: { enableLanguageSelector: false }
    });

    waitFor(() => {
      expect(
        screen.queryByRole("combobox", { name: "Choose language" })
      ).not.toBeInTheDocument();
    });
  });
});

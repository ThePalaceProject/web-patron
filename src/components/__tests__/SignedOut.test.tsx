import * as React from "react";
import { render, screen, setup, waitFor } from "test-utils";
import { SignedOutContent } from "pages/[library]/signed-out";

test("renders signed out page", () => {
  setup(<SignedOutContent />);
  expect(
    screen.getByRole("heading", { name: /signed out/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /return to catalog/i })
  ).toBeInTheDocument();
});

describe("LanguageSelector", () => {
  it("displays when enabled in appConfig", async () => {
    render(<SignedOutContent />, {
      appConfig: { enableLanguageSelector: true }
    });

    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: "Choose language" })
      ).toBeInTheDocument();
    });
  });

  it("does not display when disabled in appConfig", async () => {
    render(<SignedOutContent />, {
      appConfig: { enableLanguageSelector: false }
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("combobox", { name: "Choose language" })
      ).not.toBeInTheDocument();
    });
  });
});

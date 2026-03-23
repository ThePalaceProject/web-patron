import * as React from "react";
import { screen, setup } from "test-utils";
import { SignedOutContent } from "../signed-out";

test("renders signed out page", () => {
  setup(<SignedOutContent />);
  expect(
    screen.getByRole("heading", { name: /signed out/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /return to catalog/i })
  ).toBeInTheDocument();
});

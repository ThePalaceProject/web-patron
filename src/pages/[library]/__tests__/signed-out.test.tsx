import * as React from "react";
import { screen, setup } from "test-utils";
import { SignedOutContent } from "../signed-out";

test("does not show error message without signoutServerError query param", () => {
  setup(<SignedOutContent />, { router: { query: {} } });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("shows error message with role=alert when signoutServerError=1", () => {
  setup(<SignedOutContent />, {
    router: { query: { signoutServerError: "1" } }
  });
  const alert = screen.getByRole("alert");
  expect(alert).toBeInTheDocument();
  expect(alert).toHaveTextContent(/sign out encountered an error/i);
});

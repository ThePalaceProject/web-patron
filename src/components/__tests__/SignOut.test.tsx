import * as React from "react";
import { fixtures, screen, setup, waitFor } from "../../test-utils";
import { SignOut } from "components/SignOut";

test("Shows button", () => {
  setup(<SignOut />);
  expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
});

test("Modal is initially hidden", async () => {
  setup(<SignOut />);
  const modal = await screen.findByLabelText("Sign Out");
  expect(modal).toHaveStyle("display: none");
  expect(modal).not.toBeVisible();
});

test("Shows modal on click", async () => {
  const { user } = setup(<SignOut />);
  const signOut = await screen.findByRole("button", { name: "Sign Out" });
  await user.click(signOut);

  const modal = await screen.findByLabelText("Sign Out");
  screen.debug(modal);

  expect(modal).toHaveStyle({
    display: "block",
    position: "fixed",
    height: "fit-content",
    maxWidth: "400px",
    inset: "0.75rem",
    margin: "auto"
  });
  expect(modal).toBeVisible();

  expect(screen.getByText("Are you sure you want to sign out?")).toBeVisible();
});

test("hides dialog on cancel", async () => {
  const { user } = setup(<SignOut />);
  const signOut = await screen.findByRole("button", { name: "Sign Out" });
  // show
  await user.click(signOut);
  expect(screen.getByLabelText("Sign Out")).toBeVisible();

  const cancel = await screen.findByRole("button", { name: "Cancel" });

  await user.click(cancel);
  await waitFor(() =>
    expect(screen.getByLabelText("Sign Out")).not.toBeVisible()
  );
});

test("signs out on click signout", async () => {
  const { user } = setup(<SignOut />);
  const signOut = await screen.findByRole("button", { name: "Sign Out" });

  await user.click(signOut);
  const signOutForReal = await screen.findByRole("button", {
    name: "Confirm Sign Out"
  });

  expect(fixtures.mockSignOut).toHaveBeenCalledTimes(0);
  await user.click(signOutForReal);
  expect(fixtures.mockSignOut).toHaveBeenCalledTimes(1);
});

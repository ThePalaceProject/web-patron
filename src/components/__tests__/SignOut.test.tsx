import * as React from "react";
import { fixtures, setup } from "../../test-utils";
import { SignOut } from "components/SignOut";
import { screen } from "@testing-library/react";

test("Shows button", () => {
  setup(<SignOut />);
  expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
});

test("Modal is initially hidden", () => {
  setup(<SignOut />);
  const modal = screen.getByLabelText("Sign Out");
  expect(modal).toHaveStyle("display: none");
  expect(modal).not.toBeVisible();
});

test("Shows modal on click", async () => {
  const { user } = setup(<SignOut />);
  const signOut = screen.getByRole("button", { name: "Sign Out" });
  await user.click(signOut);

  const modal = screen.getByLabelText("Sign Out");

  expect(modal).toHaveStyle("display: block");
  expect(modal).toBeVisible();

  expect(screen.getByText("Are you sure you want to sign out?")).toBeVisible();
});

test("hides dialog on cancel", async () => {
  const { user } = setup(<SignOut />);
  const signOut = screen.getByRole("button", { name: "Sign Out" });
  // show
  await user.click(signOut);
  expect(screen.getByLabelText("Sign Out")).toBeVisible();

  const cancel = screen.getByRole("button", { name: "Cancel" });

  await user.click(cancel);
  expect(screen.getByLabelText("Sign Out")).not.toBeVisible();
});

test("signs out on click signout", async () => {
  const { user } = setup(<SignOut />);
  const signOut = screen.getByRole("button", { name: "Sign Out" });

  await user.click(signOut);
  const signOutForReal = screen.getByRole("button", {
    name: "Confirm Sign Out"
  });

  expect(fixtures.mockSignOut).toHaveBeenCalledTimes(0);
  await user.click(signOutForReal);
  expect(fixtures.mockSignOut).toHaveBeenCalledTimes(1);
});

// const mockCookie
// test("Shows button", () => {
//   const utils = render(<SignOut />);
//   expect(utils.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
// });

// test("Modal is initially hidden", () => {
//   const utils = render(<SignOut />);
//   const modal = utils.getByLabelText("Sign Out");
//   expect(modal).toHaveStyle("display: none");
//   expect(modal).not.toBeVisible();
// });

// test("Shows modal on click", async () => {
//   const utils = render(<SignOut />);
//   const signOut = utils.getByRole("button", { name: "Sign Out" });
//   act(() => userEvent.click(signOut));

//   const modal = utils.getByLabelText("Sign Out");

//   expect(modal).toHaveStyle("display: block");
//   expect(modal).toBeVisible();

//   expect(utils.getByText("Are you sure you want to sign out?")).toBeVisible();
// });

// // test("hides dialog on cancel", () => {
// //   const utils = render(<SignOut />);
// //   const signOut = utils.getByRole("button", { name: "Sign Out" });
// //   // show
// //   act(() => userEvent.click(signOut));
// //   expect(utils.getByLabelText("Sign Out")).toBeVisible();

// //   const cancel = utils.getByRole("button", { name: "Cancel" });

// //   act(() => userEvent.click(cancel));
// //   expect(utils.getByLabelText("Sign Out")).not.toBeVisible();
// // });

// test("hides dialog on cancel", async () => {
//   render(<SignOut />);
//   const signOut = screen.getByRole("button", { name: "Sign Out" });
//   // show
//   userEvent.click(signOut);
//   expect(screen.getByLabelText("Sign Out")).toBeVisible();

//   const cancel = screen.getByRole("button", { name: "Cancel" });

//   userEvent.click(cancel);
//   expect(screen.getByLabelText("Sign Out")).not.toBeVisible();
// });

// test("signs out on click signout", () => {
//   const utils = render(<SignOut />);
//   const signOut = utils.getByRole("button", { name: "Sign Out" });

//   act(() => userEvent.click(signOut));
//   const signOutForReal = utils.getByRole("button", {
//     name: "Confirm Sign Out"
//   });

//   expect(fixtures.mockSignOut).toHaveBeenCalledTimes(0);
//   act(() => userEvent.click(signOutForReal));
//   expect(fixtures.mockSignOut).toHaveBeenCalledTimes(1);
// });

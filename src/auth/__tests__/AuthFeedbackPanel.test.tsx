import * as React from "react";
import { render, setup } from "test-utils";
import { AuthFeedbackPanel } from "../AuthFeedbackPanel";

test("renders message and Try Again button", () => {
  const onTryAgain = jest.fn();
  const utils = render(
    <AuthFeedbackPanel
      message="Something went wrong."
      onTryAgain={onTryAgain}
    />
  );
  expect(utils.getByText("Something went wrong.")).toBeInTheDocument();
  expect(utils.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
  expect(
    utils.queryByRole("button", { name: /sign out|different account/i })
  ).not.toBeInTheDocument();
});

test("does not render secondary button when secondaryAction is not provided", () => {
  const utils = render(
    <AuthFeedbackPanel message="Error." onTryAgain={jest.fn()} />
  );
  expect(utils.getAllByRole("button")).toHaveLength(1);
});

test("renders secondary action button when provided", () => {
  const onSecondary = jest.fn();
  const utils = render(
    <AuthFeedbackPanel
      message="Error."
      onTryAgain={jest.fn()}
      secondaryAction={{
        label: "Use a different account",
        onClick: onSecondary
      }}
    />
  );
  expect(
    utils.getByRole("button", { name: "Use a different account" })
  ).toBeInTheDocument();
});

test("calls secondary action onClick when secondary button is clicked", async () => {
  const onSecondary = jest.fn();
  const utils = setup(
    <AuthFeedbackPanel
      message="Error."
      onTryAgain={jest.fn()}
      secondaryAction={{
        label: "Use a different account",
        onClick: onSecondary
      }}
    />
  );
  await utils.user.click(
    utils.getByRole("button", { name: "Use a different account" })
  );
  expect(onSecondary).toHaveBeenCalledTimes(1);
});

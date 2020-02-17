import * as React from "react";
import { action } from "@storybook/addon-actions";
import { DefaultFallback } from "../ErrorBoundary";

export default {
  component: DefaultFallback,
  title: "ErrorBoundary"
};

const error = new Error("You did something stupid!");
export const Default = () => <DefaultFallback error={error} />;

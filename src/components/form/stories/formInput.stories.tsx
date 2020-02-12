import * as React from "react";
import FormInput from "../FormInput";

export default {
  component: FormInput,
  title: "Form/Input"
};

/**
 * Basic
 * Required
 * With error
 *
 * Future?
 *  - no label
 *  - help text
 *  - with icon
 */

export const Basic = () => (
  <form>
    <FormInput name="basic" label="Basic Input" />
  </form>
);

export const Required = () => (
  <FormInput name="required" required label="Required Input" />
);

export const WithError = () => (
  <FormInput
    name="withError"
    label="With Error"
    error="You did something wrong."
  />
);

/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import FormLabel from "./FormLabel";
import TextInput from "../TextInput";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  error?: string;
}
/**
 * An input component to be used in a form that supports errors,
 * labels and uses the base TextInput component
 */
const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ type = "text", label, name, error, ...props }: FormInputProps, ref) => {
    return (
      <React.Fragment>
        <FormLabel sx={{ mb: 1 }} htmlFor={name}>
          {label}
        </FormLabel>
        <TextInput
          id={name}
          name={name}
          aria-label={`${name} input`}
          ref={ref}
          type={type}
          sx={{ mb: 2 }}
          {...props}
        />
        <span sx={{ color: "warn", fontStyle: "italic" }}>{error}</span>
      </React.Fragment>
    );
  }
);

export default FormInput;

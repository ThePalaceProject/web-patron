/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
// interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
/**
 * A base component that can be easily customized within
 * the CPW design system
 */
const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  type = "text",
  ...props
}) => {
  return (
    <input
      type={type}
      sx={{
        borderRadius: 3,
        borderColor: "blues.primary",
        borderWidth: 2,
        p: 1,
        fontSize: 2
      }}
      {...props}
    />
  );
};

export default TextInput;

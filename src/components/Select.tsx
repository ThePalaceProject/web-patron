/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import TextInput from "./TextInput";

type SelectProps = React.ComponentProps<"select">;
const Select: React.FC<SelectProps> = ({ children, ...props }) => {
  return (
    <select sx={{ variant: "inputs.select" }} {...props}>
      {children}
    </select>
  );
};

export default Select;

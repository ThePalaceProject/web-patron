/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

type SelectProps = React.ComponentProps<"select">;
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, ...props }, ref) => {
    return (
      <select ref={ref} sx={{ variant: "inputs.select" }} {...props}>
        {children}
      </select>
    );
  }
);

export const Label: React.FC<React.ComponentProps<"label">> = ({
  children,
  ...props
}) => {
  return (
    <label sx={{ whiteSpace: "nowrap" }} {...props}>
      {children}
    </label>
  );
};

export default Select;

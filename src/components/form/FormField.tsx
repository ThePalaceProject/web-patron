/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

const FormField: React.FC<{ className?: string }> = ({
  className,
  children
}) => {
  return (
    <div
      className={className}
      sx={{ width: "100%", position: "relative" }}
      role="group"
    >
      {children}
    </div>
  );
};

export default FormField;

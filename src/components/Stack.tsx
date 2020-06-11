/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

type StackProps = {
  direction?: "row" | "column";
  spacing?: number | string;
};
const Stack: React.FC<StackProps> = ({
  direction = "row",
  spacing = 2,
  children,
  ...rest
}) => {
  const numChildren = React.Children.count(children);

  return (
    <div
      sx={{
        display: "flex"
      }}
      {...rest}
    >
      {React.Children.map(children, (child, index) => {
        const isLastChild = index === numChildren - 1;
        const newSpacing = {
          mr: !isLastChild && direction === "row" ? spacing : undefined,
          mb: !isLastChild && direction === "column" ? spacing : undefined
        };
        if (!React.isValidElement(child)) return null;
        return <div sx={newSpacing}>{child}</div>;
      })}
    </div>
  );
};

export default Stack;

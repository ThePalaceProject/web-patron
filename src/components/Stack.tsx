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
  const validChildrenArray = React.Children.toArray(children).filter(
    React.isValidElement
  );

  return (
    <div sx={{ display: "flex" }} {...rest}>
      {validChildrenArray.map((child, index) => {
        const isLastChild = validChildrenArray.length === index + 1;
        const spacingProps =
          direction === "row"
            ? { sx: { mr: isLastChild ? null : spacing } }
            : { sx: { mb: isLastChild ? null : spacing } };

        return React.cloneElement(child, spacingProps);
      })}
    </div>
  );
};

export default Stack;

/** @jsx jsx */
import { jsx, css } from "theme-ui";
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
    <div sx={{ display: "flex" }} {...rest}>
      {React.Children.map(children, (child, index) => {
        const isLastChild = index === numChildren - 1;
        if (!React.isValidElement(child)) return null;
        const propsWithSpacing =
          direction === "row"
            ? {
                css: css({
                  mr: isLastChild ? null : spacing
                }),
                ...child.props
              }
            : {
                css: css({ mb: isLastChild ? null : spacing }),
                ...child.props
              };

        return React.cloneElement(child, propsWithSpacing);
      })}
    </div>
  );
};

export default Stack;

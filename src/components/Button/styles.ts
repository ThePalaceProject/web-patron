import { SystemStyleObject } from "@styled-system/css";
import { darken, lightness } from "@theme-ui/color";
import { ButtonSize, ButtonVariant, IconButtonVariant } from "./index";

export const sizes = {
  sm: {},
  md: {
    height: 32,
    minWidth: 32,
    fontSize: "-1",
    px: 3
  },
  lg: {
    height: 43,
    minWidth: 43,
    px: 4
  }
};

const buttonBase = {
  display: "inline-flex",
  appearance: "none",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  px: 3,
  border: 0,
  borderRadius: "button",
  cursor: "pointer",
  textDecoration: "none",
  bg: "transparent"
};

export const iconButtonBase = {
  borderStyle: "none",
  cursor: "pointer",
  bg: "transparent",
  "&:focus": {
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "ui.blue.focus",
    borderRadius: "2px"
  }
};

export const inputIconButton = {
  height: "100%",
  width: "100%"
};

export const iconButtonStyleProps = (
  variant: IconButtonVariant
): SystemStyleObject => {
  switch (variant) {
    case "input":
      return {
        ...iconButtonBase,
        ...inputIconButton
      };
    default:
      throw new Error(
        `You chose an unimplemented Icon Button Variant: ${variant}`
      );
  }
};

export const styleProps = (
  color: string,
  size: ButtonSize,
  variant: ButtonVariant
): SystemStyleObject => {
  switch (variant) {
    case "filled":
      //Prevent text color from being white if the background is set to white.
      const textColor = color === "ui.white" ? "ui.black" : "ui.white";
      return {
        // sets the text style
        variant: "text.body.regular",
        ...buttonBase,
        ...sizes[size],
        bg: color,
        color: textColor,
        fill: textColor,
        "&:focus,&:hover": {
          bg: darken(color, 0.05),
          color: textColor,
          textDecoration: "none"
        },
        "&:focus": {
          boxShadow: "focus"
        },
        "&:active": {
          bg: darken(color, 0.1)
        },
        "&:disabled": {
          bg: "ui.gray.light",
          color: "ui.gray.extraDark",
          cursor: "default"
        }
      };

    case "ghost":
      return {
        // sets the text style
        variant: "text.body.bold",
        ...buttonBase,
        ...sizes[size],
        bg: "transparent",
        color: color,
        fill: color,
        "&:focus,&:hover": {
          bg: lightness(color, 0.85),
          color: color,
          textDecoration: "none"
        },
        "&:focus": {
          boxShadow: "focus"
        },
        "&:active": {
          // bg: darken(color, 0.1)
        }
      };

    case "link":
      return {
        ...buttonBase,
        variant: "text.link.text",
        p: 0,
        color,
        fill: color,
        "&:hover": {
          color
        }
      };

    default:
      throw new Error(`You chose an unimplemented Button Variant: ${variant}`);
  }
};

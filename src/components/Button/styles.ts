import { SystemStyleObject } from "@styled-system/css";
import { darken, lightness } from "@theme-ui/color";
import { ButtonSize, ButtonVariant } from "./index";

export const sizes = {
  sm: {},
  md: {
    height: 32,
    minWidth: 32,
    fontSize: "-1",
    px: 3
  },
  lg: {
    height: 48,
    minWidth: 48,
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
  m: 0,
  px: 3,
  border: 0,
  borderRadius: "button",
  cursor: "pointer",
  textDecoration: "none"
};

export const styleProps = (
  color: string,
  size: ButtonSize,
  variant: ButtonVariant
): SystemStyleObject => {
  switch (variant) {
    case "filled":
      return {
        // sets the text style
        variant: "text.body.regular",
        ...buttonBase,
        ...sizes[size],
        bg: color,
        color: "white",
        fill: "white",
        "&:focus,&:hover": {
          bg: darken("primary", 0.05)
        },
        "&:active": {
          bg: darken("primary", 0.1)
        },
        "&:disabled": {
          bg: "ui.gray.light",
          color: "ui.gray.dark",
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
          bg: lightness(color, 0.85)
        },
        "&:active": {
          // bg: darken(color, 0.1)
        }
      };

    default:
      throw new Error(`You chose an unimplemented Button Variant: ${variant}`);
  }
};

// export const style = (color: string) =>
// {
// primary: {
//   ...buttonBase,
//   bg: "primary",
//   color: "white",
//   fill: "white",
//   "&:focus,&:hover": {
//     bg: darken("primary", 0.05)
//   },
//   "&:active": {
//     bg: darken("primary", 0.1)
//   },
//   "&:disabled": {
//     bg: "disabled",
//     cursor: "default"
//   }
// },
//   accent: {
//     ...buttonBase,
//     bg: "accent",
//     color: "white",
//     fill: "white",
//     "&:focus,&:hover": {
//       bg: darken("accent", 0.05)
//     },
//     "&:active": {
//       bg: darken("accent", 0.1)
//     },
//     "&:disabled": {
//       bg: "disabled",
//       cursor: "default"
//     }
//   }
// };
// flat: {
//   ...buttonBase,
//   bg: "white",
//   color: "blues.dark",
//   "&:focus,&:hover": {
//     bg: alpha("primary", 0.2)
//   },
//   "&:active": {
//     bg: alpha("primary", 0.4)
//   },
//   "&:disabled": {
//     color: "grey",
//     cursor: "default"
//   }
// }

import { Overloadable } from ".";

/**
 * In CM we want to allow libraries to set:
 *  - Primaries array
 *  - all named colors
 */

const primaries = ["#e1e6f2", "#6899CB", "#0467a6", "#0F2259"] as Overloadable<
  string[],
  string
>;
// helpful aliases
primaries.dark = primaries[3];
primaries.primary = primaries[2];
primaries.medium = primaries[1];
primaries.light = primaries[0];

const grey = "#B3B9BE";

const ui = {
  black: "#000000",
  white: "#ffffff",
  error: "#97272c",
  link: {
    primary: "#0071ce",
    secondary: "#004b98"
  },
  disabled: {
    primary: "#e0e0e0",
    secondary: "#004b98"
  },
  gray: {
    extraDark: "#424242",
    dark: "#616161",
    medium: "#bdbdbd",
    light: "#e0e0e0",
    lightWarm: "#EFEDEB",
    extraLight: "#f5f5f5",
    extraLightWarm: "#f8f8f7",
    extraExtraLight: "#fafafa"
  }
};

const brand = {
  primary: "#377F8B",
  secondary: "#D53F34"
};

const colors = {
  // body color
  text: ui.black,
  // body background color
  background: ui.white,
  // Primary button and link color
  primary: brand.primary,
  // a range of colors based on the primary color
  primaries,
  // Secondary color - can be used for hover states
  secondary: brand.secondary,
  // A contrast color for emphasizing UI
  accent: "#D00854",
  // A gray or subdued color for decorative purposes
  muted: grey,
  // a color for when errors appear
  warn: "#d93025",

  disabled: grey,

  lightGrey: "#f4f4f4",
  grey,

  ui,
  brand
};

export default colors;

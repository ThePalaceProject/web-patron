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

const colors = {
  // body color
  text: primaries.dark,
  // body background color
  background: "#fff",
  // Primary button and link color
  primary: primaries.primary,
  // a range of colors based on the primary color
  primaries,
  // Secondary color - can be used for hover states
  secondary: primaries.medium,
  // A contrast color for emphasizing UI
  accent: "#D00854",
  // A gray or subdued color for decorative purposes
  muted: grey,
  // a color for when errors appear
  warn: "#d93025",

  disabled: grey,

  lightGrey: "#f4f4f4",
  grey
};

export default colors;

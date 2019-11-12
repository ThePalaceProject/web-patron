import * as ThemeUi from "theme-ui";

/**
 * It is sometimes useful to define the variables outside the theme object
 * so they can be referenced easily in the theme object
 */
const heading = {
  fontFamily: "heading",
  lineHeight: "heading",
  fontWeight: "heading",
};

// Custom color variables
const blues = ["#e1e6f2", "#6899CB", "#0367A6", "#0F2259"];
const pink = "#D00854";
const grey = "#B3B9BE";
const lightGrey = "#f4f4f4";

// Theme color settings... includes above colors
const colors = {
  text: blues[3],
  background: "#fff",

  // ** Colors as intentions **
  // Primary button and link color
  primary: blues[2],
  // Secondary color - can be used for hover states
  secondary: blues[1],
  // A contrast color for emphasizing UI
  accent: pink,
  // A gray or subdued color for decorative purposes
  muted: blues[0],

  // Colors can also be referenced by their aliases directly when needed
  backgroundBlue: blues[0],
  lightBlue: blues[1],
  mediumBlue: blues[2],
  darkBlue: blues[3],
  lightGrey,
  pink,
  grey,
};

/** Borders */
const radii = [0, 2, 4, 8];

const theme: ThemeUi.Theme = {
  colors,
  breakpoints: ["40em", "52em", "64em"],
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  sizes: {
    container: 850    // This is currently only used on bookdetails. Might be useful elsewhere tho. We'll see
  },
  // Borders
  radii,
  borders: {
    solid: "1px solid",
  },
  fonts: {
    body: "system-ui, sans-serif",
    heading: "inherit",
    monospace: "Menlo, monospace",
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },

  styles: {
    root: {
      fontFamily: "body",
      lineHeight: "body",
      fontWeight: "body",
    },
    h1: {
      ...heading,
      fontSize: 5,
    },
    h2: {
      ...heading,
      fontSize: 4,
    },
    h3: {
      ...heading,
      fontSize: 3,
    },
    h4: {
      ...heading,
      fontSize: 2,
    },
    h5: {
      ...heading,
      fontSize: 1,
    },
    h6: {
      ...heading,
      fontSize: 0,
    },
    pre: {
      fontFamily: "monospace",
      overflowX: "auto",
      code: {
        color: "inherit",
      },
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
    },
    th: {
      textAlign: "left",
      borderBottomStyle: "solid",
    },
    td: {
      textAlign: "left",
      borderBottomStyle: "solid",
    },
  },
};

export default theme;
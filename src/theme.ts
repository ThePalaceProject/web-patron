import * as ThemeUi from "theme-ui";

type Overloadable<T> = T & {
  [overload: string]: any;
};
/**
 * It is sometimes useful to define the variables outside the theme object
 * so they can be referenced easily in the theme object
 */
const heading = {
  fontFamily: "heading",
  lineHeight: "heading",
  fontWeight: "heading"
};

/**
 * COLORS
 */
const blues: Overloadable<Array<string>> = [
  "#e1e6f2",
  "#6899CB",
  "#0467a6",
  "#0F2259"
];
// helpful aliases
blues.dark = blues[3];
blues.primary = blues[2];
blues.medium = blues[1];
blues.light = blues[0];

const pink = "#D00854";
const grey = "#B3B9BE";
const lightGrey = "#f4f4f4";

// Theme color settings... includes above colors
const colors = {
  text: blues.dark,
  background: "#fff",

  // ** Colors as intentions **
  // Primary button and link color
  primary: blues.primary,
  // Secondary color - can be used for hover states
  secondary: blues.medium,
  // A contrast color for emphasizing UI
  accent: pink,
  // A gray or subdued color for decorative purposes
  muted: blues.light,

  blues,
  lightGrey,
  pink,
  grey
};

/** Borders */
const radii = [0, 2, 4, 8];

const theme: ThemeUi.Theme = {
  colors,
  breakpoints: ["40em", "52em", "64em"],
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  sizes: {
    container: 850 // This is currently only used on bookdetails. Might be useful elsewhere tho. We'll see
  },
  // Borders
  radii,
  borders: {
    solid: "1px solid"
  },
  fonts: {
    body: "system-ui, sans-serif",
    heading: "inherit",
    monospace: "Menlo, monospace"
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125
  },

  styles: {
    root: {
      fontFamily: "body",
      lineHeight: "body",
      fontWeight: "body"
    },
    h1: {
      ...heading,
      fontSize: 5
    },
    h2: {
      ...heading,
      fontSize: 4
    },
    h3: {
      ...heading,
      fontSize: 3
    },
    h4: {
      ...heading,
      fontSize: 2
    },
    h5: {
      ...heading,
      fontSize: 1
    },
    h6: {
      ...heading,
      fontSize: 0
    },
    pre: {
      fontFamily: "monospace",
      overflowX: "auto",
      code: {
        color: "inherit"
      }
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0
    },
    th: {
      textAlign: "left",
      borderBottomStyle: "solid"
    },
    td: {
      textAlign: "left",
      borderBottomStyle: "solid"
    }
  }
};

export default theme;

import * as ThemeUi from "theme-ui";
import { darken, lighten } from "@theme-ui/color";
import { SystemStyleObject } from "@styled-system/css";

type Overloadable<T, K> = T & {
  [overload: string]: K;
};

export type ButtonVariants = {
  primary: SystemStyleObject;
  flat: SystemStyleObject;
  accent: SystemStyleObject;
};

export type TextVariants = {};

export type CardVariants = {
  bookDetails: SystemStyleObject;
};

export type Theme = {
  text: TextVariants;
  buttons: ButtonVariants;
  cards: CardVariants;
  colors: ThemeUi.Theme["colors"];
} & ThemeUi.Theme;
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
const blues = [
  "#e1e6f2",
  "#6899CB",
  "#0467a6",
  "#0F2259"
  // have to cast it beecause ts doesn't let you overload
  // array literals usually
] as Overloadable<string[], string>;
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
const radii = [0, 2, 4, 8] as Overloadable<number[], number>;
radii.card = radii[3];

const theme: Theme = {
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
    body: "Oswald, system-ui, sans-serif",
    heading: "inherit",
    monospace: "Menlo, monospace",
    bookTitle: "Jomhuria"
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    light: 200,
    body: 300,
    heading: 400,
    bold: 700
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125
  },

  styles: {
    /**
     * root wraps the whole app and these are therefore
     * the default styles
     */
    root: {
      fontFamily: "body",
      lineHeight: "body",
      fontWeight: "body",
      color: "blues.dark"
    },
    h1: {
      ...heading,
      fontSize: 6
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
      fontSize: 2,
      fontWeight: "normal"
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
    },
    a: {
      cursor: "pointer",
      textDecoration: "none"
    }
  },
  // variants
  text: {
    bookTitle: {
      fontFamily: "bookTitle",
      lineHeight: 0.9,
      fontWeight: 200
    }
  },
  cards: {
    bookDetails: {
      maxWidth: ["none", "none", 800],
      mx: [2, 2, "auto"],
      my: 3
    }
  },
  buttons: {
    primary: {
      bg: "primary",
      color: "white",
      fill: "white",
      borderRadius: "8px",
      "&:focus,&:hover": {
        bg: darken("primary", 0.05)
      },
      "&:active": {
        bg: darken("primary", 0.1)
      },
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    },
    accent: {
      bg: "accent",
      color: "white",
      fill: "white",
      borderRadius: "8px",
      "&:focus,&:hover": {
        bg: darken("accent", 0.05)
      },
      "&:active": {
        bg: darken("accent", 0.1)
      },
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    },
    flat: {
      bg: "white",
      color: "blues.dark"
    }
  }
};

export default theme;

import { darken } from "@theme-ui/color";

const buttonBase = {
  appearance: "none",
  display: "inline-flex",
  alignItems: "center",
  textAlign: "center",
  lineHeight: "inherit",
  textDecoration: "none",
  fontSize: "inherit",
  fontWeight: "bold",
  m: 0,
  px: 3,
  py: 1,
  border: 0,
  borderRadius: 2,
  cursor: "pointer",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const variants = {
  // variants
  text: {
    bookTitle: {
      fontFamily: "bookTitle",
      fontSize: 3,
      fontWeight: "bold",
      mb: 0,
      mt: 3
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
      ...buttonBase,
      bg: "primary",
      color: "white",
      fill: "white",
      "&:focus,&:hover": {
        bg: darken("primary", 0.05)
      },
      "&:active": {
        bg: darken("primary", 0.1)
      },
      "&:disabled": {
        bg: "disabled",
        cursor: "default"
      }
    },
    accent: {
      ...buttonBase,
      bg: "accent",
      color: "white",
      fill: "white",
      "&:focus,&:hover": {
        bg: darken("accent", 0.05)
      },
      "&:active": {
        bg: darken("accent", 0.1)
      },
      "&:disabled": {
        bg: "disabled",
        cursor: "default"
      }
    },
    flat: {
      bg: "white",
      color: "blues.dark"
    }
  },
  inputs: {
    select: {
      borderRadius: 2,
      borderWidth: 2,
      p: 1,
      fontSize: 2,
      width: "100%"
    }
  }
};
export default variants;

const variants = {
  text: {
    bookTitle: {
      fontSize: 3,
      fontWeight: "bold",
      mb: 0,
      mt: 3
    },
    headers: {
      primary: {
        fontSize: 4,
        fontWeight: "light",
        lineHeight: 1
      },
      secondary: {
        fontSize: 3,
        fontWeight: "medium",
        lineHeight: 2
      },
      tertiary: {
        fontSize: 2,
        fontWeight: "regular",
        lineHeight: 2
      }
    },
    callouts: {
      regular: {
        fontSize: 1,
        fontWeight: "regular",
        lineHeight: 2
      },
      bold: {
        fontSize: 1,
        fontWeight: "bold",
        lineHeight: 2
      },
      italic: {
        fontSize: 1,
        fontWeight: "regular",
        lineHeight: 2,
        fontStyle: "italic"
      }
    },
    body: {
      regular: {
        fontSize: 0,
        fontWeight: "light",
        lineHeight: 3
      },
      bold: {
        fontSize: 0,
        fontWeight: "bold",
        lineHeight: 3
      },
      italic: {
        fontSize: 0,
        fontWeight: "light",
        lineHeight: 3,
        fontStyle: "italic"
      }
    },
    textLink: {
      fontSize: 0,
      fontWeight: "light",
      lineHeight: 3,
      color: "ui.link.primary",
      textDecoration: "underline"
    }
  },
  cards: {
    bookDetails: {
      maxWidth: ["none", "none", 800],
      mx: [2, 2, "auto"],
      my: 3
    }
  },
  inputs: {
    // select: {
    //   borderRadius: 2,
    //   borderWidth: 2,
    //   p: 1,
    //   fontSize: 2,
    //   width: "100%"
    // }
    select: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      position: "relative",
      pl: 1,
      pr: 2,
      height: "2rem",
      fontSize: 2,
      lineHeight: "normal",
      bg: "white",
      pb: 1,
      transition: "all 0.2s ease 0s",
      borderRadius: 2,
      border: "solid",
      borderColor: "primary"
    }
  },
  lists: {
    unstyled: {
      m: 0,
      p: 0,
      "&>li": {
        listStyle: "none"
      }
    }
  }
};
export default variants;

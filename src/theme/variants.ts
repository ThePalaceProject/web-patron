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

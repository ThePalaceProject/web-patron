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
        fontFamily: "body",
        fontSize: 4,
        fontWeight: "light",
        lineHeight: 1
      },
      secondary: {
        fontFamily: "body",
        fontSize: 3,
        fontWeight: "medium",
        lineHeight: 2
      },
      tertiary: {
        fontFamily: "body",
        fontSize: 2,
        fontWeight: "regular",
        lineHeight: 2
      }
    },
    callouts: {
      regular: {
        fontFamily: "body",
        fontSize: 1,
        fontWeight: "regular",
        lineHeight: 2
      },
      bold: {
        fontFamily: "body",
        fontSize: 1,
        fontWeight: "bold",
        lineHeight: 2
      },
      italic: {
        fontFamily: "body",
        fontSize: 1,
        fontWeight: "regular",
        lineHeight: 2,
        fontStyle: "italic"
      }
    },
    body: {
      regular: {
        fontFamily: "body",
        fontSize: 0,
        fontWeight: "light",
        lineHeight: 3
      },
      bold: {
        fontFamily: "body",
        fontSize: 0,
        fontWeight: "bold",
        lineHeight: 3
      },
      italic: {
        fontFamily: "body",
        fontSize: 0,
        fontWeight: "light",
        lineHeight: 3,
        fontStyle: "italic"
      }
    },
    textLink: {
      fontFamily: "body",
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

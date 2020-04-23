import { heading } from "./typography";

const styles = {
  /**
   * root wraps the whole app and these are therefore
   * the default styles
   */
  root: {
    fontFamily: "body",
    fontSize: 2,
    lineHeight: "body",
    fontWeight: "body",
    color: "text"
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
  a: {
    cursor: "pointer",
    textDecoration: "none"
  },
  ul: {
    p: 0,
    m: 0
  },
  li: {
    listStyle: "none"
  }
};

export default styles;

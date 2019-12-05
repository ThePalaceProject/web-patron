/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import GlobalStyles from "./GlobalStyles";
import Header from "./Header";

/**
 * Will take over from opds-web-client to handle layout
 * of the app: header, main, footer. Will import from
 * opds web client as necessary
 *
 * How will it handle the data that opds<Root> is passing in to
 * each of the components it renders? Should that be available in
 * context or should it be passed via render prop or what?
 */

const Layout = () => {
  return (
    <React.Fragment>
      <GlobalStyles />
      {/* <Header /> */}
      <main>hi from main</main>
    </React.Fragment>
  );
};

export default Layout;

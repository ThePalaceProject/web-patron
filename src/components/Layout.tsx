/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import GlobalStyles from "./GlobalStyles";
import Header from "./Header";
import Footer from "./Footer";
import SkipNavigation from "./SkipNavigation";
import { ErrorBoundary } from "components/ErrorBoundary";

export const CONTENT_ID = "cpw-content";

const Layout: React.FC<{
  bg?: string;
  showHeader: boolean;
  showFooter: boolean;
}> = ({ children, bg, showHeader = true, showFooter = true }) => {
  return (
    <Styled.root
      sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <SkipNavigation />
      <GlobalStyles />
      {showHeader && <Header sx={{ width: "100%" }} />}
      <main
        id={CONTENT_ID}
        sx={{
          flex: "1 1 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          bg
        }}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      {showFooter && <Footer sx={{ width: "100%" }} />}
    </Styled.root>
  );
};

export default Layout;

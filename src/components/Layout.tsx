/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import GlobalStyles from "./GlobalStyles";
import Header from "./Header";
import Footer from "./Footer";
import SkipNavigation from "./SkipNavigation";
import { ErrorBoundary } from "components/ErrorBoundary";

export const CONTENT_ID = "cpw-content";

const Layout: React.FC = ({ children }) => {
  return (
    <Styled.root
      sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <SkipNavigation />
      <GlobalStyles />
      <Header sx={{ width: "100%" }} />
      <main
        id={CONTENT_ID}
        sx={{
          flex: "1 1 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer sx={{ width: "100%" }} />
    </Styled.root>
  );
};

export default Layout;

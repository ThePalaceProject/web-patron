import * as React from "react";
import { ThemeUIProvider } from "theme-ui";
import { Themed } from "@theme-ui/mdx";
import WorkLibrarySelector from "components/WorkLibrarySelector";
import theme from "theme/theme";

interface ItemLandingPageProps {
  workId: string;
}

const ItemLandingPage: React.FC<ItemLandingPageProps> = ({ workId }) => (
  <ThemeUIProvider theme={theme}>
    <Themed.root
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        m: 3
      }}
    >
      <h1>Find a Library</h1>
      <WorkLibrarySelector workId={workId} />
    </Themed.root>
  </ThemeUIProvider>
);

export default ItemLandingPage;

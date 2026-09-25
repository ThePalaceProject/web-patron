import * as React from "react";
import { ThemeUIProvider } from "theme-ui";
import { Themed } from "@theme-ui/mdx";
import WorkLibrarySelector from "components/WorkLibrarySelector";
import theme from "theme/theme";
import { useTranslation } from "next-i18next/pages";
import MultiLibraryLandingPageHeader from "./layouts/MultiLibraryLandingPageHeader";

interface ItemLandingPageProps {
  workId: string;
}

const ItemLandingPage: React.FC<ItemLandingPageProps> = ({ workId }) => {
  const { t } = useTranslation();
  return (
    <ThemeUIProvider theme={theme}>
      <Themed.root
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          m: 3
        }}
      >
        <MultiLibraryLandingPageHeader
          heading={t("itemLandingPage.findLibrary", "Find a Library")}
        />
        <WorkLibrarySelector workId={workId} />
      </Themed.root>
    </ThemeUIProvider>
  );
};

export default ItemLandingPage;

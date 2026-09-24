import * as React from "react";
import { ThemeUIProvider } from "theme-ui";
import { Themed } from "@theme-ui/mdx";
import WorkLibrarySelector from "components/WorkLibrarySelector";
import theme from "theme/theme";
import { useTranslation } from "next-i18next/pages";
import LanguageSelector from "./LanguageSelector";

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
        <div
          sx={{
            display: "flex",
            flexDirection: ["column", "row"],
            justifyContent: "space-between"
          }}
        >
          <h1 sx={{ order: [2, 1] }}>
            {t("itemLandingPage.findLibrary", "Find a Library")}
          </h1>
          <LanguageSelector
            sx={{
              order: [1, 2],
              width: "fit-content",
              alignSelf: ["end", "unset"]
            }}
          />
        </div>
        <WorkLibrarySelector workId={workId} />
      </Themed.root>
    </ThemeUIProvider>
  );
};

export default ItemLandingPage;

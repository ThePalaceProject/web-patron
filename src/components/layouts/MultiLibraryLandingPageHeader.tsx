import LanguageSelector from "components/LanguageSelector";
import PalaceWebCatalogLogo from "components/PalaceWebCatalogLogo";
import Stack from "components/Stack";
import * as React from "react";

interface MultiLibraryLandingPageHeaderProps {
  heading?: string;
}

const MultiLibraryLandingPageHeader: React.FC<
  MultiLibraryLandingPageHeaderProps
> = ({ heading }) => {
  return (
    <div
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
      }}
    >
      <Stack direction="column" sx={{ mb: 3 }}>
        {heading ? (
          <>
            <PalaceWebCatalogLogo />
            <h1 sx={{ mt: 3 }}>{heading}</h1>
          </>
        ) : (
          <h1>
            <PalaceWebCatalogLogo />
          </h1>
        )}
      </Stack>
      <div>
        <LanguageSelector />
      </div>
    </div>
  );
};

export default MultiLibraryLandingPageHeader;

import LanguageSelector from "components/LanguageSelector";
import * as React from "react";

interface MultiLibraryLandingPageHeaderProps {
  heading: string;
}

const MultiLibraryLandingPageHeader: React.FC<
  MultiLibraryLandingPageHeaderProps
> = ({ heading }) => {
  return (
    <div
      sx={{
        display: "flex",
        flexDirection: ["column", "row"],
        justifyContent: "space-between"
      }}
    >
      <h1 sx={{ order: [2, 1] }}>{heading}</h1>
      <LanguageSelector
        sx={{
          order: [1, 2],
          width: "fit-content",
          alignSelf: ["end", "unset"]
        }}
      />
    </div>
  );
};

export default MultiLibraryLandingPageHeader;

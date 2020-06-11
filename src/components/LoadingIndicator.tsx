/** @jsx jsx */
import { jsx, useThemeUI } from "theme-ui";
import * as React from "react";
import FadeLoader from "react-spinners/FadeLoader";
import { H2 } from "./Text";

const LoadingIndicator: React.FC = props => {
  const { theme } = useThemeUI();
  const darkBlue = theme.colors?.primaries?.[3];

  return <FadeLoader color={darkBlue} {...props} />;
};

export const PageLoader: React.FC = () => {
  return (
    <div
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flex: "1 0 auto"
      }}
    >
      <LoadingIndicator />
      <H2 sx={{ fontSize: 2 }}>Loading...</H2>
    </div>
  );
};

export default LoadingIndicator;

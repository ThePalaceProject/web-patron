/** @jsx jsx */
import { jsx, Styled, useThemeUI } from "theme-ui";
import * as React from "react";
import FadeLoader from "react-spinners/FadeLoader";

const LoadingIndicator: React.FC = props => {
  const { theme } = useThemeUI();
  const darkBlue = theme.colors.blues[3];

  return <FadeLoader color={darkBlue} {...props} />;
};

export const PageLoader: React.FC = props => {
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
      <Styled.h4>Loading...</Styled.h4>
    </div>
  );
};

export default LoadingIndicator;

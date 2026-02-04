import * as React from "react";
import { LibraryData } from "interfaces";
import { LibraryProvider } from "./LibraryContext";
// import { Provider as ReakitProvider } from "@ariakit/react";
import { ThemeUIProvider } from "theme-ui";
import makeTheme from "../../theme";
import { UserProvider } from "components/context/UserContext";
import { SWRConfig } from "swr";
import swrConfig from "utils/swrConfig";
import CatchFetchErrors from "auth/Catch401";

type ProviderProps = {
  library: LibraryData;
  children: React.ReactNode;
};

/**
 * Combines all of the apps context provider into a single component for simplicity
 */
const AppContextProvider: React.FC<ProviderProps> = ({ children, library }) => {
  const theme = makeTheme(library.colors);

  return (
    <SWRConfig value={swrConfig}>
      <ThemeUIProvider theme={theme}>
        <LibraryProvider library={library}>
          <UserProvider>
            <CatchFetchErrors>{children}</CatchFetchErrors>
          </UserProvider>
        </LibraryProvider>
      </ThemeUIProvider>
    </SWRConfig>
  );
};

export default AppContextProvider;

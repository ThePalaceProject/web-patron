import * as React from "react";
import type { AppConfig } from "interfaces";

const AppConfigContext = React.createContext<AppConfig | undefined>(undefined);

export function useAppConfig(): AppConfig {
  const context = React.useContext(AppConfigContext);
  if (context === undefined) {
    throw new Error(
      "useAppConfig must be used within an AppConfigContext.Provider"
    );
  }
  return context;
}

export default AppConfigContext;

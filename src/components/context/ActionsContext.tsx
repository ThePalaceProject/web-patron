import * as React from "react";
import ActionsCreator from "opds-web-client/lib/actions";
import { useDataFetcher } from "./DataFetcherContext";

const ActionsContext = React.createContext<ActionsCreator | undefined>(
  undefined
);

export function ActionsProvider({ children }) {
  const fetcher = useDataFetcher();
  const actions = new ActionsCreator(fetcher);

  return (
    <ActionsContext.Provider value={actions}>
      {children}
    </ActionsContext.Provider>
  );
}

export function useActions() {
  const context = React.useContext(ActionsContext);
  if (typeof context === "undefined") {
    throw new Error("useActions must be used within a ActionsProvider");
  }
  return context;
}

export default ActionsContext;

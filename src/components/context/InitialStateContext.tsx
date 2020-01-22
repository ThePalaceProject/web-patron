import * as React from "react";
import { State as CatalogState } from "opds-web-client/lib/state";

export const InitialStateContext = React.createContext<
  CatalogState | undefined
>(undefined);

export const InitialStateProvider: React.FC<{ initialState: CatalogState }> = ({
  initialState,
  children
}) => (
  <InitialStateContext.Provider value={initialState}>
    {children}
  </InitialStateContext.Provider>
);

export default function useInitialState() {
  const context = React.useContext(InitialStateContext);
  if (typeof context === "undefined") {
    throw new Error(
      "useInitialState must be used within a InitialStateContextProvider"
    );
  }
  return context;
}

import * as React from "react";
import { State as CatalogState } from "opds-web-client/lib/state";

const InitialStateContext = React.createContext<CatalogState>(null);

export const InitialStateProvider: React.FC<{ initialState: CatalogState }> = ({
  initialState,
  children
}) => (
  <InitialStateContext.Provider value={initialState}>
    {children}
  </InitialStateContext.Provider>
);

export default InitialStateContext;

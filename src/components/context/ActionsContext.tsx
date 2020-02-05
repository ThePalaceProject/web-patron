import * as React from "react";
import ActionsCreator from "opds-web-client/lib/actions";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
import useThunkDispatch from "../../hooks/useThunkDispatch";

const ActionsContext = React.createContext<ActionsCreator | undefined>(
  undefined
);

export const ActionsProvider: React.FC<{ proxyUrl?: string }> = ({
  children,
  proxyUrl
}) => {
  // create our datafetcher
  const fetcher = new DataFetcher({
    proxyUrl,
    adapter
  });
  const actions = new ActionsCreator(fetcher);

  return (
    <ActionsContext.Provider value={actions}>
      {children}
    </ActionsContext.Provider>
  );
};

export function useActions() {
  const context = React.useContext(ActionsContext);
  const dispatch = useThunkDispatch();
  if (typeof context === "undefined") {
    throw new Error("useActions must be used within a ActionsProvider");
  }
  return { actions: context, dispatch };
}

export default ActionsContext;

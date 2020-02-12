import * as React from "react";
import ActionsCreator from "opds-web-client/lib/actions";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";
import useThunkDispatch from "../../hooks/useThunkDispatch";

type ActionsContextType =
  | { fetcher: DataFetcher; actions: ActionsCreator }
  | undefined;
const ActionsContext = React.createContext<ActionsContextType>(undefined);

export const ActionsProvider: React.FC<{ proxyUrl?: string }> = ({
  children,
  proxyUrl
}) => {
  // create our context and save it in a ref
  const fetcher = new DataFetcher({
    proxyUrl,
    adapter
  });
  const actions = new ActionsCreator(fetcher);

  return (
    <ActionsContext.Provider value={{ actions, fetcher }}>
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
  const { actions, fetcher } = context;
  return { actions, fetcher, dispatch };
}

export default ActionsContext;

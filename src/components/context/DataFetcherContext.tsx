import * as React from "react";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";

const DataFetcherContext = React.createContext<DataFetcher | undefined>(
  undefined
);

export function DataFetcherProvider({ children, proxyUrl = null }) {
  // create our datafetcher
  const fetcher = new DataFetcher({
    proxyUrl,
    adapter
  });

  return (
    <DataFetcherContext.Provider value={fetcher}>
      {children}
    </DataFetcherContext.Provider>
  );
}

export function useDataFetcher() {
  const context = React.useContext(DataFetcherContext);
  if (typeof context === "undefined") {
    throw new Error("useDataFetcher must be used within a DataFetcherProvider");
  }
  return context;
}

export default DataFetcherContext;

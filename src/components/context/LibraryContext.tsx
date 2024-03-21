import * as React from "react";
import { LibraryData } from "../../interfaces";

const LibraryContext = React.createContext<LibraryData | undefined>(undefined);

export const LibraryProvider: React.FC<{
  library: LibraryData;
  children: React.ReactNode;
}> = ({
  library, children
}) => (
  <LibraryContext.Provider value={library}>{children}</LibraryContext.Provider>
);

export default function useLibraryContext() {
  const context = React.useContext(LibraryContext);
  if (typeof context === "undefined") {
    throw new Error(
      "useLibraryContext must be used within a LibraryContextProvider"
    );
  }
  return context;
}

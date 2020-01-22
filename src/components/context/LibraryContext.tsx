import * as React from "react";
import { LibraryData } from "../../interfaces";

const LibraryContext = React.createContext<LibraryData | undefined>(undefined);

export const LibraryContextProvider: React.FC<{ library: LibraryData }> = ({
  library,
  children
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

import * as React from "react";
import { LibraryData } from "../../interfaces";

const LibraryContext = React.createContext<LibraryData>(null);

export const LibraryContextProvider: React.FC<{ library: LibraryData }> = ({
  library,
  children
}) => (
  <LibraryContext.Provider value={library}>{children}</LibraryContext.Provider>
);

export default LibraryContext;

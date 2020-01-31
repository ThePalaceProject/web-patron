/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

type FilterState = "ALL" | "EBOOKS" | "AUDIOBOOKS";
type FilterContext = {
  filterState: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
};

const FilterStateContext = React.createContext<FilterContext | undefined>(
  undefined
);

export const FilterStateProvider: React.FC = ({ children }) => {
  const [filterState, setFilter] = React.useState<FilterState>("ALL");

  const value = React.useMemo(() => ({ filterState, setFilter }), [
    filterState,
    setFilter
  ]);

  return (
    <FilterStateContext.Provider value={value}>
      {children}
    </FilterStateContext.Provider>
  );
};

export default function useFilterState() {
  const context = React.useContext(FilterStateContext);
  if (typeof context === "undefined") {
    throw new Error("useFilterState must be used within a FilterStateProvider");
  }
  return context;
}

import * as React from "react";

type ViewState = "GALLERY" | "LIST";
export const ViewContext = React.createContext<
  { view: ViewState; setView: (view: ViewState) => void } | undefined
>(undefined);

export const ViewProvider: React.FC = ({ children }) => {
  const [view, setView] = React.useState<ViewState>("GALLERY");

  return (
    <ViewContext.Provider value={{ view, setView }}>
      {children}
    </ViewContext.Provider>
  );
};

function useView() {
  const context = React.useContext(ViewContext);

  if (typeof context === "undefined") {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
}

export default useView;

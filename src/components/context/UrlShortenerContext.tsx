import * as React from "react";
import UrlShortener from "../../UrlShortener";

const UrlShortenerContext = React.createContext<UrlShortener>(null);

export const UrlShortenerProvider: React.FC<{
  urlShortener: UrlShortener;
}> = ({ urlShortener, children }) => (
  <UrlShortenerContext.Provider value={urlShortener}>
    {children}
  </UrlShortenerContext.Provider>
);

export function useUrlShortener() {
  const context = React.useContext(UrlShortenerContext);
  if (typeof context === "undefined") {
    throw new Error(
      "useUrlShortener must be used within a UrlShortenerProvider"
    );
  }
  return context;
}

export default UrlShortenerContext;

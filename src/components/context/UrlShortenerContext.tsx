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

export default UrlShortenerContext;

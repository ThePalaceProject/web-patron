import * as React from "react";
import * as Redux from "redux";
import { LibraryData, WebpackAssets, PreloadedData } from "../../interfaces";
import { State } from "opds-web-client/lib/state";
import getAssets, { renderCSS, renderJS } from "./getAssets";

interface HtmlProps {
  content?: string;
  library: LibraryData;
  preloadedState: State;
  shortenUrls: any;
  assets: WebpackAssets;
}

const Html = ({
  content,
  library,
  preloadedState,
  shortenUrls,
  assets
}: HtmlProps) => {
  const collectionTitle =
    preloadedState.collection &&
    preloadedState.collection.data &&
    preloadedState.collection.data.title;

  const bookTitle =
    preloadedState.book &&
    preloadedState.book.data &&
    preloadedState.book.data.title;

  const details = bookTitle || collectionTitle;
  const pageTitle = library.catalogName + (details ? " - " + details : "");

  const preloadedData: PreloadedData = {
    library,
    shortenUrls,
    initialState: preloadedState
  };

  return (
    <html lang="en">
      <head>
        <title>{pageTitle}</title>
        {library.cssLinks?.map(link => (
          <link
            key={link.href}
            href={link.href}
            rel={link.rel}
            crossOrigin="anonymous"
          />
        ))}
        {renderCSS(assets.CirculationPatronWeb)}
        <link
          href="https://fonts.googleapis.com/css?family=Jomhuria|Oswald:300,400,500&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body>
        <div
          id="circulation-patron-web"
          dangerouslySetInnerHTML={{
            __html: content ? content : ""
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__PRELOADED_DATA__=${JSON.stringify(
              preloadedData
            )};`
          }}
          charSet="UTF-8"
        />
        {renderJS(assets.CirculationPatronWeb)}
      </body>
    </html>
  );
};

export const DOCTYPE = "<!DOCTYPE html>";

export default Html;

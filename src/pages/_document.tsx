import * as React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { GTMScript, GTMNoscript } from "analytics/GoogleTagManager";

class MyDocument extends Document {
  render() {
    // process.env.GTM_ID is accessible here because _document.tsx is server-only.
    const gtmId = process.env.GTM_ID ?? null;
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" sizes="32x32" />
          <link rel="icon" type="image/svg+xml" href="/icon.svg" sizes="any" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <GTMScript gtmId={gtmId} />
        </Head>
        <body>
          <GTMNoscript gtmId={gtmId} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

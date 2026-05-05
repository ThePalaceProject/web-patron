import * as React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { GTMScript, GTMNoscript } from "analytics/GoogleTagManager";

class MyDocument extends Document {
  render() {
    // process.env.GTM_ID is accessible here because _document.tsx is server-only.
    const gtmId = process.env.GTM_ID ?? null;
    return (
      <Html lang="en">
        <Head>
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

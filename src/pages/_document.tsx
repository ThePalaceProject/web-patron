import * as React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import GoogleTagManager from "analytics/GoogleTagManager";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <GoogleTagManager />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import ContextProvider from "./components/context/ContextProvider";
import { BrowserRouter } from "react-router-dom";
/**
 * This data is set on the window when server-rendering
 */
// eslint-disable-next-line no-underscore-dangle
const preloadedData = window.__PRELOADED_DATA__;
// eslint-disable-next-line no-underscore-dangle
delete window.__PRELOADED_DATA__;
const element = document.getElementById("circulation-patron-web");

ReactDOM.hydrate(
  <BrowserRouter>
    <ContextProvider {...preloadedData}>
      <App />
    </ContextProvider>
  </BrowserRouter>,
  element
);

if (process.env.NODE_ENV === "development" && process.env.AXE_TEST === "true") {
  console.log("Running with react-axe");
  const axe = require("react-axe");
  axe(React, ReactDOM, 1000);
}

import * as React from "react";
import * as ReactDOM from "react-dom";
import App from './App'
import ContextProvider from "./components/ContextProvider";
import {BrowserRouter} from 'react-router-dom'
/**
 * This data is set on the window when server-rendering
 */
const preloadedData = window.__PRELOADED_DATA__;
delete window.__PRELOADED_DATA__;
const element = document.getElementById("circulation-patron-web")

ReactDOM.hydrate(
  <BrowserRouter>
    <ContextProvider {...preloadedData}>
      <App />
    </ContextProvider >
  </BrowserRouter>, 
  element)
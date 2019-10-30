import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
import ContextProvider from "./components/ContextProvider";
import { singleLibraryRoutes, multiLibraryRoutes } from "./routes";
import ThemeProvider from 'theme-ui';
import theme from './theme'

class CirculationPatronWeb {
  constructor(config) {
    let divId = "circulation-patron-web";

    ReactDOM.render(
      <ThemeProvider theme={theme}>
        <ContextProvider {...config}>
          {config.library.onlyLibrary ?
            <Router history={browserHistory} routes={singleLibraryRoutes} /> :
            <Router history={browserHistory} routes={multiLibraryRoutes} />
          }
        </ContextProvider>
      </ThemeProvider>,
      document.getElementById(divId)
    );
  }
}

export = CirculationPatronWeb;
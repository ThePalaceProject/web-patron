import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
import ContextProvider from "./components/ContextProvider";
import routes from "./routes";

class CirculationPatronWeb {
  constructor(config) {
    let divId = "circulation-patron-web";

    ReactDOM.render(
      <ContextProvider {...config}>
        <Router history={browserHistory} routes={routes} />
      </ContextProvider>,
      document.getElementById(divId)
    );
  }
}

export = CirculationPatronWeb;
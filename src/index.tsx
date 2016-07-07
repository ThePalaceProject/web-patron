import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
import ContextProvider from "./components/ContextProvider";
import CatalogHandler from "./components/CatalogHandler";

require("bootstrap/dist/css/bootstrap.css");

class CirculationPatronWeb {
  constructor(config) {
    let div = document.createElement("div");
    div.id = "circulation-patron-web";
    document.getElementsByTagName("body")[0].appendChild(div);

    let catalogPath = "/web(/collection/:collectionUrl)(/book/:bookUrl)";

    ReactDOM.render(
      <ContextProvider {...config}>
        <Router history={browserHistory}>
          <Route path={catalogPath} component={CatalogHandler} />
        </Router>
      </ContextProvider>,
      document.getElementById(div.id)
    );
  }
}

export = CirculationPatronWeb;
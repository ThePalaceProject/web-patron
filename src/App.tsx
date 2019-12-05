import * as React from "react";
import * as ReactDOM from "react-dom";
import { Switch, Route } from "react-router-dom";
import { singleLibraryRoutes, multiLibraryRoutes } from "./routes";
import { ThemeProvider } from "theme-ui";
import theme from "./theme";
import { hot } from "react-hot-loader/root";
import { AppContext } from "./components/ContextProvider";

const App = () => {
  const { library } = React.useContext(AppContext);
  return (
    <ThemeProvider theme={theme}>
      <Switch>
        {library.onlyLibrary
          ? singleLibraryRoutes.map(route => (
              <Route key={route.path} {...route} />
            ))
          : multiLibraryRoutes.map(route => (
              <Route key={route.path} {...route} />
            ))}
      </Switch>
    </ThemeProvider>
  );
};

export default hot(App);

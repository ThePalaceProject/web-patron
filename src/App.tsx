import * as React from "react";
import { Switch, Route } from "react-router-dom";
import { singleLibraryRoutes, multiLibraryRoutes } from "./routes";
import { ThemeProvider } from "theme-ui";
import theme from "./theme";
import { hot } from "react-hot-loader/root";
import Layout from "./components/Layout";
import useLibraryContext from "./components/context/LibraryContext";

const App: React.FunctionComponent = () => {
  const library = useLibraryContext();

  return (
    <ThemeProvider theme={theme}>
      <Layout>
        <Switch>
          {library.onlyLibrary
            ? singleLibraryRoutes.map(route => (
                <Route key={route.path} {...route} />
              ))
            : multiLibraryRoutes.map(route => (
                <Route key={route.path} {...route} />
              ))}
        </Switch>
      </Layout>
    </ThemeProvider>
  );
};

export default hot(App);

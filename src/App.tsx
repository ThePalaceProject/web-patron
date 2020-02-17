import * as React from "react";
import { Switch, Route } from "react-router-dom";
import { singleLibraryRoutes, multiLibraryRoutes } from "./routes";
import { ThemeProvider } from "theme-ui";
import theme from "./theme";
import { hot } from "react-hot-loader/root";
import Layout from "./components/Layout";
import useLibraryContext from "./components/context/LibraryContext";
import Auth from "./components/Auth";
import ErrorBoundary from "./components/ErrorBoundary";
import { Helmet } from "react-helmet-async";

const App: React.FunctionComponent = () => {
  const library = useLibraryContext();

  return (
    <ErrorBoundary fallback={AppErrorFallback}>
      <Helmet>
        <title>{library.catalogName}</title>
      </Helmet>
      <ThemeProvider theme={theme}>
        <Auth>
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
        </Auth>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

const AppErrorFallback: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div>
      <p sx={{ textAlign: "center" }}>{message}</p>
    </div>
  );
};

export default hot(App);

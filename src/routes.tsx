import * as React from "react";
import BookDetails from "./components/bookDetails";
import Collection from "./components/Collection";
import MyBooks from "./components/MyBooks";
import { Redirect, RouteComponentProps } from "react-router-dom";
import NoMatch from "./components/404";

export const singleLibraryRoutes = [
  {
    path: "/book/:bookUrl",
    component: BookDetails,
    exact: true
  },
  {
    // this is the old path that is now "/loans", which makes more sense
    // we need to redirect, otherwise we will call setCollectionAndBook
    // with collectionUrl = loans, which will result in a 401.
    path: "/collection/loans",
    exact: true,
    // eslint-disable-next-line react/display-name
    component: () => <Redirect to="/loans" />
  },
  {
    path: "/loans",
    component: MyBooks,
    exact: true
    // protectedRoute: true
  },
  {
    path: "/collection/:collectionUrl",
    component: Collection,
    exact: true
  },
  {
    path: "/",
    exact: true,
    component: Collection
  },
  {
    path: "*",
    component: NoMatch,
    exact: false
  }
];

export const multiLibraryRoutes = [
  {
    path: "/:library/book/:bookUrl",
    component: BookDetails,
    exact: true
  },
  {
    // this is the old path that is now "/loans", which makes more sense
    // we need to redirect, otherwise we will call setCollectionAndBook
    // with collectionUrl = loans, which will result in a 401.
    path: "/:library/collection/loans",
    exact: true,
    // eslint-disable-next-line react/display-name
    component: (props: RouteComponentProps<{ library: string }>) => (
      <Redirect to={`/${props.match.params.library}/loans`} />
    )
  },
  {
    path: "/:library/loans",
    component: MyBooks,
    exact: true
    // protectedRoute: true
  },
  {
    path: "/:library/collection/:collectionUrl",
    component: Collection,
    exact: true
  },
  {
    path: "/:library/",
    exact: true,
    component: Collection
  },
  {
    path: "*",
    component: NoMatch,
    exact: false
  }
];

export default multiLibraryRoutes;

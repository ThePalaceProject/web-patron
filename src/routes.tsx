import * as React from "react";
import BookDetails from "./components/bookDetails";
import Collection from "./components/Collection";
import MyBooks from "./components/MyBooks";
import { Redirect } from "react-router-dom";

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
  }
];

export const multiLibraryRoutes = [
  {
    path: "/:library/book/:bookUrl",
    component: BookDetails,
    exact: false
  },
  {
    path: "/:library(/)(collection/:collectionUrl)(/)(book/:bookUrl)",
    component: Collection,
    exact: false
  },
  {
    path: "/",
    exact: true,
    component: Collection
  }
];

export default multiLibraryRoutes;

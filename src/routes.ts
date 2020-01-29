import BookDetails from "./pages/bookDetails";
import Home from "./pages/home";
import Collection from "./pages/collection";

export const singleLibraryRoutes = [
  {
    path: "/book/:bookUrl",
    component: BookDetails,
    exact: true
  },
  {
    path: "/collection/:collectionUrl",
    component: Collection,
    exact: true
  },
  {
    path: "/",
    exact: true,
    component: Home
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
    component: Home
  }
];

export default multiLibraryRoutes;

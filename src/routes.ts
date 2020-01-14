import CatalogHandler from "./components/CatalogHandler";
import BookDetails from "./pages/bookDetails";

export const singleLibraryRoutes = [
  {
    path: "/book/:bookUrl",
    component: BookDetails,
    exact: true
  },
  {
    path: "/(collection/:collectionUrl)(/)(book/:bookUrl)",
    component: CatalogHandler,
    exact: true
  },
  {
    path: "/",
    exact: true,
    component: CatalogHandler
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
    component: CatalogHandler,
    exact: false
  },
  {
    path: "/",
    exact: true,
    component: CatalogHandler
  }
];

export default multiLibraryRoutes;

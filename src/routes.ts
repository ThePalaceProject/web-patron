import CatalogHandler from "./components/CatalogHandler";

export const singleLibraryRoutes = [
  {
    path: "/(collection/:collectionUrl)(/)(book/:bookUrl)",
    component: CatalogHandler,
    exact: false
  },
  {
    path: "/",
    exact: true,
    component: CatalogHandler,
  }
];

export const multiLibraryRoutes = [
  {
    path: "/:library(/)(collection/:collectionUrl)(/)(book/:bookUrl)",
    component: CatalogHandler,
    exact: false,
  },{
    path: "/",
    exact: true,
    component: CatalogHandler
  }
];


export default multiLibraryRoutes;

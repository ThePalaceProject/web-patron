import CatalogHandler from "./components/CatalogHandler";

const routes = [
  {
    path: "/(collection/:collectionUrl)(/)(book/:bookUrl)",
    component: CatalogHandler
  }
];

export default routes;
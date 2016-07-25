import CatalogHandler from "./components/CatalogHandler";

const routes = [
  {
    path: "/web(/collection/:collectionUrl)(/book/:bookUrl)",
    component: CatalogHandler
  }
];

export default routes;
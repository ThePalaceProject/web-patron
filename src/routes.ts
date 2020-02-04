import BookDetails from "./components/bookDetails";
import Collection from "./components/Collection";
import MyBooks from "./components/MyBooks";

export const singleLibraryRoutes = [
  {
    path: "/book/:bookUrl",
    component: BookDetails,
    exact: true
  },
  {
    path: "/collection/loans",
    component: MyBooks,
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

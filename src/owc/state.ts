import buildStore from "./store";
import { createFetchCollectionAndBook } from "owc/mergeRootProps";
import { CollectionState } from "./reducers/collection";
import { BookState } from "./reducers/book";
import { PreferencesState } from "./reducers/preferences";

export interface State {
  collection: CollectionState;
  book: BookState;
  preferences: PreferencesState;
}

/** Builds initial redux state for a collection and book. This isn't used in this
    package, but it's available for other apps if they need to build the state
    for server-side rendering. */
export default function buildInitialState(
  collectionUrl?: string,
  bookUrl?: string
): Promise<State> {
  const store = buildStore();
  const fetchCollectionAndBook = createFetchCollectionAndBook(store.dispatch);
  return new Promise((resolve, reject) => {
    fetchCollectionAndBook(collectionUrl, bookUrl)
      .then(() => {
        resolve(store.getState());
      })
      .catch(err => reject(err));
  });
}

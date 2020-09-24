import { createStore, applyMiddleware, Store } from "redux";
import reducers from "./reducers/index";
import { State } from "./state";
const thunk = require("redux-thunk").default;
import { composeWithDevTools } from "redux-devtools-extension";

let persistState: any = null;

try {
  const testKey = String(Math.random());
  window.localStorage.setItem(testKey, "test");
  window.localStorage.removeItem(testKey);
  persistState = require("redux-localstorage");
} catch (e) {
  // localStorage isn't available in this environment, so preferences won't be saved.
}

/** Builds the Redux store. If any auth plugins are passed in, it will add auth middleware.
    If localStorage is available, it will persist the preferences state only. */
export default function buildStore(initialState?: State): Store<State> {
  const middlewares = [thunk];
  const composeArgs = [applyMiddleware(...middlewares)];
  if (persistState) {
    composeArgs.push(persistState("preferences"));
  }
  return createStore(
    reducers,
    initialState,
    composeWithDevTools.apply(this, composeArgs)
  );
}

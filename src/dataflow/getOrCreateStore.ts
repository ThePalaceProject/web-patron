/* eslint-disable no-underscore-dangle */
import { State } from "owc/state";
import buildStore from "owc/store";
import { IS_SERVER, __NEXT_REDUX_STORE__ } from "../utils/env";
/**
 * This function is for use in getInitialProps of the _app component
 * and page components. It creates a new store every time on the
 * server, and on the client it will reuse the store on the window
 */

function getOrCreateStore(initialState?: State) {
  // Always make a new store if server, otherwise state is shared between requests
  if (IS_SERVER) {
    return buildStore(undefined);
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = buildStore(initialState);
  }
  // return our cached store
  return window[__NEXT_REDUX_STORE__];
}

export default getOrCreateStore;

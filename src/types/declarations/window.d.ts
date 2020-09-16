import { Store, AnyAction } from "redux";
import { State } from "owc/state";

declare global {
  interface Window {
    __NEXT_REDUX_STORE__: Store<State, AnyAction> | undefined;
  }
}

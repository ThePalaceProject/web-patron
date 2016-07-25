import { combineReducers } from "redux";
import complaints, { ComplaintsState } from "./complaints";

export interface State {
  complaints: ComplaintsState;
}

export default combineReducers<State>({
  complaints
});
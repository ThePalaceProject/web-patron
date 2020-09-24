import { combineReducers, Reducer } from "redux";
import collection from "./collection";
import book from "./book";
import preferences from "./preferences";
import { State } from "../state";

const reducers: Reducer<State> = combineReducers<State>({
  collection,
  book,
  preferences
});

export default reducers;

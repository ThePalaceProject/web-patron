import { FetchErrorData } from "../interfaces";
import ActionCreator from "../actions";
import { BookData } from "interfaces";

export interface BookState {
  url: string | null;
  data: BookData | null;
  isFetching: boolean;
  error: FetchErrorData | null;
}

const initialState: BookState = {
  url: null,
  data: null,
  isFetching: false,
  error: null
};

const book = (state: BookState = initialState, action): BookState => {
  switch (action.type) {
    case ActionCreator.BOOK_REQUEST:
      return {
        ...state,
        isFetching: true,
        error: null
      };

    case ActionCreator.BOOK_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.error
      };

    case ActionCreator.BOOK_LOAD:
      return {
        ...state,
        data: action.data,
        url: action.url ? action.url : state.url,
        isFetching: false
      };

    case ActionCreator.BOOK_CLEAR:
      return {
        ...state,
        data: null,
        url: null,
        error: null
      };

    case ActionCreator.CLOSE_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

export default book;

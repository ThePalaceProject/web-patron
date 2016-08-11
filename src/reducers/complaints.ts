import { ComplaintData } from "../interfaces";
import { RequestError } from "opds-web-client/lib/DataFetcher";

export interface ComplaintsState {
  isFetching: boolean;
  isPosting: boolean;
  types: string[];
  error: any;
}

const initState: ComplaintsState = {
  isFetching: false,
  isPosting: false,
  types: [],
  error: null
};

export default (state: ComplaintsState = initState, action): ComplaintsState => {
  switch (action.type) {
    case "FETCH_COMPLAINT_TYPES_REQUEST":
      return Object.assign({}, state, {
        isFetching: true,
        error: null
      });

    case "FETCH_COMPLAINT_TYPES_SUCCESS":
      return Object.assign({}, state, {
        isFetching: false
      });

    case "FETCH_COMPLAINT_TYPES_FAILURE":
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });

    case "LOAD_COMPLAINT_TYPES":
      return Object.assign({}, state, {
        types: action.types
      });

    default:
      return state;
  }
};
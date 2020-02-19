import { ComplaintsAction } from "./actions";

export interface ComplaintsState {
  isFetching: boolean;
  isPosting: boolean;
  types: string[];
  error: any;
  showForm: boolean;
}

export const initState: ComplaintsState = {
  isFetching: false,
  isPosting: false,
  types: [],
  error: null,
  showForm: false
};

export default (
  state: ComplaintsState = initState,
  action: ComplaintsAction
): ComplaintsState => {
  switch (action.type) {
    case "REPORT_PROBLEM":
      return {
        ...state,
        showForm: true
      };
    case "REPORT_PROBLEM_CANCEL":
      return {
        ...state,
        showForm: false
      };
    case "FETCH_COMPLAINT_TYPES_REQUEST":
      return Object.assign({}, state, {
        isFetching: true,
        error: null
      });

    case "FETCH_COMPLAINT_TYPES_SUCCESS":
      return Object.assign({}, state, {
        isFetching: false,
        types: action.types
      });

    case "FETCH_COMPLAINT_TYPES_FAILURE":
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error
      });

    case "POST_COMPLAINT_REQUEST":
      return Object.assign({}, state, {
        isPosting: true,
        error: null
      });

    case "POST_COMPLAINT_SUCCESS":
      return Object.assign({}, state, {
        isPosting: false
      });

    case "POST_COMPLAINT_FAILURE":
      return Object.assign({}, state, {
        isPosting: false,
        error: action.error
      });

    default:
      return state;
  }
};

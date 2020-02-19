import * as React from "react";
import complaints, { initState } from "./reducer";
import { fetchComplaintTypes, postComplaint } from "./actions";

/**
 * We are using react useReducer instead of redux. The only real difference
 * here is that instead of using redux-thunk, we import the thunk actions
 * here and provide them with dispatch. These thunks take dispatch and return
 * a function to perform an action.
 *
 * eg. const doSomething = dispatch => url => fetch(url);
 *
 * when we call const boundDoSomething = doSomething(url),
 * boundDoSomething is a function we can then use in our app:
 * (url) => fetch(url)
 */

export default function useReportProblem() {
  const [state, dispatch] = React.useReducer(complaints, initState);

  return {
    state,
    dispatch,
    fetchComplaintTypes: fetchComplaintTypes(dispatch),
    postComplaint: postComplaint(dispatch)
  };
}

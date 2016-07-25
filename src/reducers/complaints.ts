import { ComplaintData } from "../interfaces";
import { RequestError } from "opds-web-client/lib/DataFetcher";

export interface ComplaintsState {
}

const initialState: ComplaintsState = {
};

export default (state: ComplaintsState = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};
import reducer from "opds-web-client/lib/reducers";

// this should return us a blank initial state from opds
export const initialState = reducer(undefined, { type: "init" });
export default initialState;

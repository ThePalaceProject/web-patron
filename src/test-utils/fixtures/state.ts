import reducer from "owc/reducers";

// this should return us a blank initial state from opds
export const initialState = reducer(undefined, { type: "init" });
export default initialState;

import complaints from "../reducer";
import { ComplaintsAction } from "../actions";

describe("complaints reducer", () => {
  const initState = {
    showForm: false,
    isFetching: false,
    isPosting: false,
    types: [],
    error: null,
    success: false
  };

  const errorState = {
    showForm: true,
    success: false,
    isFetching: false,
    isPosting: false,
    types: [],
    error: "test error"
  };

  test("handles FETCH_COMPLAINT_TYPES_REQUEST", () => {
    const action: ComplaintsAction = {
      type: "FETCH_COMPLAINT_TYPES_REQUEST",
      url: "test url"
    };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetching: true
    });
    expect(complaints(initState, action)).toEqual(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetching: true,
      error: null
    });
    expect(complaints(errorState, action)).toEqual(newState);
  });

  test("handles FETCH_COMPLAINT_TYPES_FAILURE", () => {
    const action: ComplaintsAction = {
      type: "FETCH_COMPLAINT_TYPES_FAILURE",
      error: Error("test error")
    };
    const oldState = {
      showForm: true,
      success: false,
      isFetching: true,
      isPosting: false,
      types: [],
      error: null
    };
    const newState = Object.assign({}, oldState, {
      error: "test error",
      isFetching: false
    });
    expect(complaints(oldState, action)).toEqual(newState);
  });

  test("handles LOAD_COMPLAINT_TYPES", () => {
    const action: ComplaintsAction = {
      type: "FETCH_COMPLAINT_TYPES_SUCCESS",
      types: ["type1", "type2"]
    };
    const newState = Object.assign({}, initState, {
      types: ["type1", "type2"]
    });
    expect(complaints(initState, action)).toEqual(newState);
  });

  test("handles POST_COMPLAINT_REQUEST", () => {
    const action: ComplaintsAction = {
      type: "POST_COMPLAINT_REQUEST",
      url: "test url"
    };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isPosting: true
    });
    expect(complaints(initState, action)).toEqual(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isPosting: true,
      error: null
    });
    expect(complaints(errorState, action)).toEqual(newState);
  });

  test("handles POST_COMPLAINT_FAILURE", () => {
    const action: ComplaintsAction = {
      type: "POST_COMPLAINT_FAILURE",
      error: Error("test error")
    };
    const oldState = {
      showForm: true,
      success: false,
      isFetching: false,
      isPosting: true,
      types: [],
      error: null
    };
    const newState = Object.assign({}, oldState, {
      error: "test error",
      isPosting: false
    });
    expect(complaints(oldState, action)).toEqual(newState);
  });
});

import { stub } from "sinon";
import * as actions from "../actions";
const fetchMock = require("fetch-mock");

let fetchResponse: string | null = null;

describe("fetchComplaintTypes", () => {
  afterEach(() => {
    fetchMock.restore();
  });

  const reportUrl = "http://example.com/report";

  test("dispatches request, load, and success", async () => {
    const dispatch = stub();
    fetchResponse = "type1\ntype2\ntype3";
    fetchMock.mock(reportUrl, fetchResponse);

    const types = await actions.fetchComplaintTypes(dispatch)(reportUrl);

    expect(dispatch.callCount).toBe(2);
    expect(dispatch.args[0][0].type).toBe("FETCH_COMPLAINT_TYPES_REQUEST");
    expect(dispatch.args[1][0].type).toBe("FETCH_COMPLAINT_TYPES_SUCCESS");
    expect(types).toEqual(["type1", "type2", "type3"]);
  });

  test("dispatches failure", async () => {
    const dispatch = stub();
    fetchMock.mock(reportUrl, Promise.reject({ message: "test error" }));

    try {
      await actions.fetchComplaintTypes(dispatch)(reportUrl);
      // Should not get here
      expect(false).toBe(true);
    } catch (err) {
      expect(dispatch.callCount).toBe(2);
      expect(dispatch.args[0][0].type).toBe("FETCH_COMPLAINT_TYPES_REQUEST");
      expect(dispatch.args[1][0].type).toBe("FETCH_COMPLAINT_TYPES_FAILURE");
      expect(err).toEqual({ message: "test error" });
    }
  });

  describe("postComplaint", () => {
    const reportUrl = "http://example.com/report";
    const data = {
      type: "bad-description",
      detail: "i would love it if this description were written as a sonnet"
    };

    test("dispatches request, load, and success", async () => {
      const dispatch = stub();
      fetchResponse = null;
      fetchMock.mock(reportUrl, { status: 200, body: fetchResponse });

      const types = await actions.postComplaint(dispatch)(reportUrl)(data);

      expect(dispatch.callCount).toBe(2);
      expect(dispatch.args[0][0].type).toBe("POST_COMPLAINT_REQUEST");
      expect(dispatch.args[1][0].type).toBe("POST_COMPLAINT_SUCCESS");
      expect(types).toBeUndefined();
    });

    test("dispatches failure", async () => {
      const dispatch = stub();
      fetchMock.mock(reportUrl, Promise.reject({ message: "test error" }));

      try {
        await actions.postComplaint(dispatch)(reportUrl)(data);
        // Should not get here
        expect(false).toBe(true);
      } catch (err) {
        expect(dispatch.callCount).toBe(2);
        expect(dispatch.args[0][0].type).toBe("POST_COMPLAINT_REQUEST");
        expect(dispatch.args[1][0].type).toBe("POST_COMPLAINT_FAILURE");
        expect(err).toEqual({ message: "test error" });
      }
    });
  });
});

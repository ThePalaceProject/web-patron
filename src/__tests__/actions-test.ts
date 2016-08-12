import { expect } from "chai";
import { stub } from "sinon";

import * as actions from "../actions";

let fetchShouldResolve = true;
let fetchResponse = null;

fetch = <any>stub({ fetch: () => {} }, "fetch", () => {
  return new Promise((resolve, reject) => {
    if (fetchShouldResolve) {
      resolve({
        status: 200,
        ok: true,
        text: () => new Promise((resolve, reject) => {
          resolve(fetchResponse);
        })
      });
    } else {
      reject({ message: "test error" });
    }
  });
});

describe("fetchComplaintTypes", () => {
  let reportUrl = "http://example.com/report";

  it("dispatches request, load, and success", (done) => {
    let dispatch = stub();
    fetchShouldResolve = true;
    fetchResponse = "type1\ntype2\ntype3";

    actions.fetchComplaintTypes(reportUrl)(dispatch).then(types => {
      expect(dispatch.callCount).to.equal(3);
      expect(dispatch.args[0][0].type).to.equal(actions.FETCH_COMPLAINT_TYPES_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(actions.FETCH_COMPLAINT_TYPES_SUCCESS);
      expect(dispatch.args[2][0].type).to.equal(actions.LOAD_COMPLAINT_TYPES);
      expect(types).to.deep.equal(["type1", "type2", "type3"]);
      done();
    }).catch(err => { console.log(err); throw(err); });
  });

  it("dispatches failure", (done) => {
    let dispatch = stub();
    fetchShouldResolve = false;

    actions.fetchComplaintTypes(reportUrl)(dispatch).catch(err => {
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.args[0][0].type).to.equal(actions.FETCH_COMPLAINT_TYPES_REQUEST);
      expect(dispatch.args[1][0].type).to.equal(actions.FETCH_COMPLAINT_TYPES_FAILURE);
      expect(err).to.deep.equal({ message: "test error" });
      done();
    });
  });

  describe("postComplaint", () => {
    let reportUrl = "http://example.com/report";
    let data = {
      type: "bad-description",
      detail: "i would love it if this description were written as a sonnet"
    };

    it("dispatches request, load, and success", (done) => {
      let dispatch = stub();
      fetchShouldResolve = true;
      fetchResponse = null;

      actions.postComplaint(reportUrl, data)(dispatch).then(types => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.POST_COMPLAINT_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.POST_COMPLAINT_SUCCESS);
        expect(types).to.equal(undefined);
        done();
      }).catch(err => { console.log(err); throw(err); });
    });

    it("dispatches failure", (done) => {
      let dispatch = stub();
      fetchShouldResolve = false;

      actions.postComplaint(reportUrl, data)(dispatch).catch(err => {
        expect(dispatch.callCount).to.equal(2);
        expect(dispatch.args[0][0].type).to.equal(actions.POST_COMPLAINT_REQUEST);
        expect(dispatch.args[1][0].type).to.equal(actions.POST_COMPLAINT_FAILURE);
        expect(err).to.deep.equal({ message: "test error" });
        done();
      });
    });
  });
});
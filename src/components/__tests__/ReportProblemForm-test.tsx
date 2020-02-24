import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";
import book from "../../__tests__/fixtures/book";
import ReportProblemForm from "../bookDetails/ReportProblem";

describe("ReportProblemForm", () => {
  let wrapper;
  let report;
  let fetchTypes;
  let close;
  let types;

  beforeEach(() => {
    types = ["problem-type1", "problem-type2", "problem-type3"];
    report = stub().returns(Promise.resolve());
    fetchTypes = stub().returns(Promise.resolve(types));
    close = stub();
    wrapper = mount(<ReportProblemForm book={book} />);
  });

  describe("rendering", () => {
    test("displays title", () => {
      const title = wrapper.find("h3");
      expect(title.text()).toBe("Report a Problem");
    });

    test("displays type dropdown", () => {
      const options = wrapper.find("select").find("option");
      const values = options.map(option => option.props().value);
      const names = options.map(option => option.text());
      expect(values).toEqual([""].concat(types));
      expect(names).toEqual(
        ["choose a type"].concat(
          types.map(type => wrapper.instance().displayType(type))
        )
      );
    });

    test("displays details input", () => {
      const details = wrapper.find("textarea");
      expect(details.props().placeholder).toBe("details");
    });

    test("displays submit button", () => {
      const button = wrapper
        .find("button")
        .filterWhere(button => button.text() === "Submit");
      expect(button.props().onClick).toBe(wrapper.instance().submit);
    });

    test("displays cancel button", () => {
      const button = wrapper
        .find("button")
        .filterWhere(button => button.text() === "Cancel");
      expect(button.props().onClick).toBe(close);
    });
  });

  describe("behavior", () => {
    test("fetches types on mount", () => {
      expect(fetchTypes.callCount).toBe(1);
      expect(fetchTypes.args[0][0]).toBe("report url");
    });

    test("displays error if submitted without type", () => {
      const button = wrapper
        .find("button")
        .filterWhere(button => button.text() === "Submit");
      button.simulate("click");
      const error = wrapper.find(".error");
      expect(error.text()).toBe("You must select a type");
    });

    test("submits", () => {
      wrapper.instance().refs = {
        type: { value: "bad-description" },
        detail: { value: "what an imperfect description!" }
      };
      const button = wrapper
        .find("button")
        .filterWhere(button => button.text() === "Submit");
      button.simulate("click");
      expect(report.callCount).toBe(1);
      expect(report.args[0][0]).toBe("report url");
      expect(report.args[0][1]).toEqual({
        type: "bad-description",
        detail: "what an imperfect description!"
      });
    });

    test("displays result and close button after submitting", async () => {
      wrapper.instance().refs = {
        type: { value: "bad-description" },
        detail: { value: "what an imperfect description!" }
      };
      await wrapper.instance().submit();

      const title = wrapper.find("h3");
      expect(title.text()).toBe("Problem Reported");
      const closeButton = wrapper.find("button").at(1);
      expect(closeButton.props().onClick).toBe(close);
    });

    test("closes", () => {
      wrapper.setState({ submitted: true });
      const closeButton = wrapper
        .find("button")
        .filterWhere(button => button.text() === "Close");
      closeButton.simulate("click");
      expect(close.callCount).toBe(1);
    });
  });
});

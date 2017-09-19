import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import CleverButton, { CleverAuthMethod } from "../CleverButton";

describe("CleverButton", () => {
  let wrapper;
  let provider;

  beforeEach(() => {
    let method = { type: "method", links: [{ "rel": "authenticate", "href": "auth" }] };
    provider = { method };

    wrapper = shallow(
      <CleverButton provider={provider} />
    );
  });

  it("shows button", () => {
    let button = wrapper.find("a");
    expect(button.length).to.equal(1);
  });

  it("links to authenticate with redirect", () => {
    let button = wrapper.find("a");
    expect(button.props().href).to.contain("auth&redirect_uri=");
  });

  it("doesn't show button if auth document is missing link", () => {
    let method: CleverAuthMethod = { type: "method" };
    provider = { method };

    wrapper = shallow(
      <CleverButton provider={provider} />
    );
    let button = wrapper.find("a");
    expect(button.length).to.equal(0);

    method = { type: "method", links: [] };
    provider = { method };

    wrapper = shallow(
      <CleverButton provider={provider} />
    );
    button = wrapper.find("a");
    expect(button.length).to.equal(0);
  });
});
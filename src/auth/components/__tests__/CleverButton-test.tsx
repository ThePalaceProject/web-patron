import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import CleverButton from "../CleverButton";

describe("CleverButton", () => {
  let wrapper;
  let provider;

  beforeEach(() => {
    provider = {
      method: {
        links: {
          authenticate: "authenticate"
        }
      }
    };

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
    expect(button.props().href).to.contain("authenticate&redirect_uri=");
  });
});
import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import BasicAuthButtonWithImage, { BasicAuthWithImageMethod } from "../BasicAuthButtonWithImage";
import BasicAuthWithButtonImagePlugin from "../../BasicAuthWithButtonImagePlugin";

describe("BasicAuthButtonWithImage", () => {
  let wrapper;
  let provider;

  beforeEach(() => {
    let method: BasicAuthWithImageMethod = { 
      type: "method",
      description: "description",
      labels: { login: "login", "password": "password" }
    };
    provider = { id: "method", method, plugin: BasicAuthWithButtonImagePlugin };
    wrapper = shallow(
      <BasicAuthButtonWithImage provider={provider} />
    );
  });

  it("shows button with no image", () => {
    let button = wrapper.find("button");
    expect(button.length).to.equal(1);
    expect(button.props()["aria-label"]).to.equal("Log in with description");
    let image = button.find("img");
    expect(image.length).to.equal(0);
  });

  it("shows button with image", () => {
    let method: BasicAuthWithImageMethod = { 
      type: "method",
      description: "description",
      labels: { login: "login", "password": "password" },
      links: [{ "rel": "logo", "href": "logo.png" }]
    };
    provider = { id: "method", method, plugin: BasicAuthWithButtonImagePlugin };

    wrapper = shallow(
      <BasicAuthButtonWithImage provider={provider} />
    );

    let button = wrapper.find("button");
    expect(button.length).to.equal(1);
    expect(button.props()["aria-label"]).to.equal("Log in with description");
    let image = button.find("img");
    expect(image.length).to.equal(1);
    expect(image.props().src).to.equal("logo.png");
    expect(image.props().alt).to.equal("Log in with description");
  });
});
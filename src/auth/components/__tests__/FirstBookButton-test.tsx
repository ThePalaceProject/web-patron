import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import FirstBookButton from "../FirstBookButton";

describe("FirstBookButton", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <FirstBookButton />
    );
  });

  it("shows button", () => {
    let button = wrapper.find("div");
    expect(button.length).to.equal(1);
  });
});
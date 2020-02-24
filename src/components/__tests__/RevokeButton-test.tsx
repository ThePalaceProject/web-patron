import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import RevokeButton from "../RevokeButton";
import ConfirmationPopup from "../ConfirmationPopup";

describe("RevokeButton", () => {
  let wrapper;
  const revoke = stub();

  beforeEach(() => {
    wrapper = shallow(<RevokeButton revoke={revoke}>Revoke</RevokeButton>);
  });

  test("shows button", () => {
    const button = wrapper.find("button");
    expect(button.text()).toBe("Revoke");
    expect(button.props().onClick).toBe(
      wrapper.instance().showConfirmationPopup
    );
  });

  test("shows popup when button is clicked", () => {
    const button = wrapper.find("button");
    button.simulate("click");
    const popup = wrapper.find(ConfirmationPopup);
    expect(popup.props().confirm).toBe(wrapper.instance().revoke);
    expect(popup.props().cancel).toBe(wrapper.instance().hideConfirmationPopup);
    expect(popup.props().text).toEqual(expect.arrayContaining(["return"]));
  });

  test("shows and hides popup", () => {
    wrapper.instance().showConfirmationPopup();
    wrapper.update();
    let popup = wrapper.find(ConfirmationPopup);
    expect(popup.length).toBe(1);

    wrapper.instance().hideConfirmationPopup();
    wrapper.update();
    popup = wrapper.find(ConfirmationPopup);
    expect(popup.length).toBe(0);
  });
});

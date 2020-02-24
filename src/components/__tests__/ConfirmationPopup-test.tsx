import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import ConfirmationPopup from "../ConfirmationPopup";

describe("ConfirmationPopup", () => {
  let wrapper;
  let confirm;
  let cancel;

  beforeEach(() => {
    confirm = stub();
    cancel = stub();
    wrapper = shallow(
      <ConfirmationPopup
        confirm={confirm}
        cancel={cancel}
        text="are you sure"
        confirmText="confirm"
        cancelText="cancel"
      />
    );
  });

  test("shows popup", () => {
    const popup = wrapper.find(".confirmation-popup");
    expect(popup.text()).toEqual(expect.arrayContaining(["are you sure"]));
    const confirmButton = wrapper.find(".confirm-button");
    const cancelButton = wrapper.find(".cancel-button");
    expect(confirmButton.text()).toBe("confirm");
    expect(cancelButton.text()).toBe("cancel");
  });

  test("calls confirm", () => {
    const confirmButton = wrapper.find(".confirm-button");
    confirmButton.simulate("click");
    expect(confirm.callCount).toBe(1);
  });

  test("calls cancel", () => {
    const cancelButton = wrapper.find(".cancel-button");
    cancelButton.simulate("click");
    expect(cancel.callCount).toBe(1);
  });
});

import * as React from "react";
import { popupStyle } from "opds-web-client/lib/components/styles";

export interface ConfirmationPopupProps {
  confirm: () => void;
  cancel: () => void;
  text: string;
  confirmText: string;
  cancelText: string;
}

export default class ConfirmationPopup extends React.Component<ConfirmationPopupProps, any> {
  render() {
    let style = popupStyle(300, 300);

    return (
      <div className="confirmation-popup" style={style}>
        <h3 style={{ marginTop: "0px", marginBottom: "20px" }}>
          { this.props.text }
        </h3>
        <button
          className="btn btn-default confirm-button"
          onClick={this.props.confirm}>
          { this.props.confirmText }
        </button>
        <button
          className="btn btn-default cancel-button"
          onClick={this.props.cancel}>
          { this.props.cancelText }
        </button>
      </div>
    );
  }
}
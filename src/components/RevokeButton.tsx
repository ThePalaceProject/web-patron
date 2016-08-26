import * as React from "react";
import ConfirmationPopup from "./ConfirmationPopup";

export interface RevokeButtonProps extends React.HTMLProps<any> {
  revoke: () => Promise<any>;
}

export default class RevokeButton extends React.Component<RevokeButtonProps, any> {
  constructor(props) {
    super(props);
    this.state = { showConfirmationPopup: false };
    this.showConfirmationPopup = this.showConfirmationPopup.bind(this);
    this.hideConfirmationPopup = this.hideConfirmationPopup.bind(this);
    this.revoke = this.revoke.bind(this);
  }

  render() {
    let props = Object.assign({}, this.props);
    delete props["revoke"];

    return (
      <div>
        <button
          className="btn btn-default"
          {...props}
          onClick={this.showConfirmationPopup}>
          {this.props.children}
        </button>
        { this.state.showConfirmationPopup &&
          <ConfirmationPopup
            confirm={this.revoke}
            cancel={this.hideConfirmationPopup}
            text="Are you sure you want to return this book?"
            confirmText="Return Now"
            cancelText="Cancel"
            />
        }
      </div>
    );
  }

  showConfirmationPopup() {
    this.setState({ showConfirmationPopup: true });
  }

  hideConfirmationPopup() {
    this.setState({ showConfirmationPopup: false });
  }

  revoke() {
    this.hideConfirmationPopup();
    return this.props.revoke();
  }
}
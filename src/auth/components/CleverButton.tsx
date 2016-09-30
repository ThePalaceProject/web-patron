import * as React from "react";
import { AuthProvider } from "opds-web-client/lib/interfaces";
import { AuthButtonProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";

export default class CleverButton extends React.Component<AuthButtonProps, any> {
  render() {
    let currentUrl = window.location.href;
    let authUrl = this.props.provider.method.links.authenticate + "&redirect_uri=" + encodeURIComponent(encodeURIComponent(currentUrl));
    return (
      <a href={authUrl} className="clever-button" aria-label="log in with clever" />
    );
  }
}
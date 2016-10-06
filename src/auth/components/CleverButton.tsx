import * as React from "react";
import { AuthProvider, AuthMethod } from "opds-web-client/lib/interfaces";
import { AuthButtonProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";

export interface CleverAuthMethod extends AuthMethod {
  links: {
    authenticate: URL;
  };
}

export default class CleverButton extends React.Component<AuthButtonProps<CleverAuthMethod>, any> {
  render() {
    let currentUrl = window.location.origin + window.location.pathname;
    let authUrl = this.props.provider.method.links.authenticate + "&redirect_uri=" + encodeURIComponent(encodeURIComponent(currentUrl));
    return (
      <a href={authUrl} className="clever-button" aria-label="log in with clever" />
    );
  }
}
import * as React from "react";
import { AuthProvider } from "opds-web-client/lib/interfaces";
import { AuthButtonProps } from "opds-web-client/lib/components/AuthProviderSelectionForm";

export default class FirstBookButton extends React.Component<AuthButtonProps, any> {
  render() {
    let label = "Log in with FirstBook";

    return (
      <div className="first-book-button" aria-label="log in with first book" />
    );
  }
}
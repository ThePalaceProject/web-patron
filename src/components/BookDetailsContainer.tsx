import * as React from "react";
import BookDetails from "./BookDetails";
import { BookDetailsContainerProps } from "opds-web-client/lib/components/Root";

export default class BookDetailsContainer extends React.Component<BookDetailsContainerProps, any> {
  render() {
    let child = React.Children.only(this.props.children);
    let book = React.createElement(BookDetails, child.props);

    return (
      <div className="bookDetailsContainer" style={{ padding: "40px", maxWidth: "700px", margin: "0 auto" }}>
        { book }
      </div>
    );
  }
}
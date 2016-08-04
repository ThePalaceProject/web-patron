import * as React from "react";
import BookDetails from "./BookDetails";
import Lanes from "opds-web-client/lib/components/Lanes";
import { BookDetailsContainerProps } from "opds-web-client/lib/components/Root";

export default class BookDetailsContainer extends React.Component<BookDetailsContainerProps, any> {
  context: any;

  static contextTypes: React.ValidationMap<any> = {
    recommendationsStore: React.PropTypes.object.isRequired,
    proxyUrl: React.PropTypes.string.isRequired
  };

  render() {
    let child = React.Children.only(this.props.children);
    let book = React.createElement(BookDetails, child.props);
    let relatedUrl = this.relatedUrl();

    return (
      <div className="bookDetailsContainer" style={{ padding: "40px", maxWidth: "700px", margin: "0 auto" }}>
        { book }
        { relatedUrl &&
          <div className="relatedBooks" style={{ marginTop: "30px" }}>
            <Lanes
              url={relatedUrl}
              store={this.context.recommendationsStore}
              proxyUrl={this.context.proxyUrl}
              hideMoreLinks={true}
              hiddenBookIds={this.props.book ? [this.props.book.id] : []}
              />
          </div>
        }
      </div>
    );
  }

  relatedUrl(): string {
    let { book } = this.props;
    if (!book) return null;

    let links = book.raw.link;
    if (!links) return null;

    let relatedLink = links.find(link => link.$.rel.value === "related");
    if (!relatedLink) return null;

    return relatedLink.$.href.value;
  }
}
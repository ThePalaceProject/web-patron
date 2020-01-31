/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import BookDetails from "./bookDetails";
import Lanes from "opds-web-client/lib/components/Lanes";
import { BookDetailsContainerProps } from "opds-web-client/lib/components/Root";
import * as PropTypes from "prop-types";

const hasProps = (child: React.ReactNode): child is React.ReactElement => {
  return (child as React.ReactElement).props !== "undefined";
};
export default class BookDetailsContainer extends React.Component<
  BookDetailsContainerProps,
  {}
> {
  context: any;

  static contextTypes: React.ValidationMap<{}> = {
    store: PropTypes.object.isRequired
  };

  render() {
    const child = React.Children.only(this.props.children);
    let childProps = {};
    if (hasProps(child)) {
      childProps = { ...child.props };
    }
    const relatedUrl = this.relatedUrl();

    return (
      <div sx={{ display: "flex", justifyContent: "center" }}>
        <div
          sx={{
            // bg: 'background',
            maxWidth: "container",
            mx: 3,
            px: 5,
            py: 4,
            border: "solid",
            borderRadius: 2,
            borderColor: "darkBlue",
            flex: 1
          }}
        >
          <BookDetails {...childProps} />
          {/* {relatedUrl &&
            <div className="related-books">
              <Lanes
                url={relatedUrl}
                store={this.context.store}
                namespace="recommendations"
                hideMoreLinks={true}
                hiddenBookIds={this.props.book ? [this.props.book.id] : []}
              />
            </div>
          } */}
        </div>
      </div>
    );
  }

  relatedUrl(): string | null {
    const { book } = this.props;
    if (!book) return null;

    const links = book.raw.link;
    if (!links) return null;

    const relatedLink = links.find(link => link.$.rel.value === "related");
    if (!relatedLink) return null;

    return relatedLink.$.href.value;
  }
}

import * as React from "react";
import ReportProblemLink from "./ReportProblemLink";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import BorrowButton from "opds-web-client/lib/components/BorrowButton";
import { BookData } from "opds-web-client/lib/interfaces";

export interface BookDetailsProps {
  book: BookData;
  borrowAndFulfillBook: (url: string) => Promise<any>;
  fulfillBook: (url: string) => Promise<any>;
}

export default class BookDetails extends React.Component<BookDetailsProps, any> {
  render(): JSX.Element {
    let bookSummaryStyle = {
      paddingTop: "2em",
      borderTop: "1px solid #ccc"
    };

    let circLink = this.circulationLink();
    let audience = this.audience();
    let categories = this.categories();
    let reportUrl = this.reportUrl();

    return (
      <div className="bookDetailsWrapper" style={{ padding: "40px", maxWidth: "700px", margin: "0 auto" }}>
        <div className="bookDetails">
          <div className="bookDetailsTop" style={{ textAlign: "left", display: "table-row" }}>
            { this.props.book.imageUrl &&
              <div className="bookImage" style={{ display: "table-cell", paddingRight: "20px", verticalAlign: "top" }}>
                <img src={this.props.book.imageUrl} style={{ height: "150px" }}/>
              </div>
            }
            <div className="bookDetailsHeader" style={{ display: "table-cell", verticalAlign: "top", textAlign: "left", maxWidth: "500px" }}>
              <h1 className="bookDetailsTitle" style={{ margin: 0 }}>{this.props.book.title}</h1>
              {
                this.props.book.authors && this.props.book.authors.length > 0 &&
                <h2 className="bookDetailsAuthors" style={{ marginTop: "0.5em", fontSize: "1.2em" }}>{this.props.book.authors.join(", ")}</h2>
              }
              {
                this.props.book.contributors && this.props.book.contributors.length > 0 &&
                <h2 className="bookDetailsContributors" style={{ marginTop: "0.5em", fontSize: "1.2em" }}>Contributors: {this.props.book.contributors.join(", ")}</h2>
              }
              <div style={{ marginTop: "2em", color: "#888", fontSize: "0.9em" }}>
                { this.props.book.published &&
                  <div className="bookDetailsPublished">Published: {this.props.book.published}</div>
                }
                {
                  this.props.book.publisher &&
                  <div className="bookDetailsPublisher">Publisher: {this.props.book.publisher}</div>
                }
                { audience &&
                  <div className="bookDetailsAudience">Audience: {audience}</div>
                }
                {
                  categories && categories.length > 0 &&
                  <div className="bookDetailsCategories">
                    {categories.length > 1 ? "Categories" : "Category"}: {categories.join(", ")}
                  </div>
                }
              </div>
            </div>
          </div>
          <div style={{ clear: "both", marginTop: "1em" }}></div>
          <div
            style={bookSummaryStyle}>
            <div className="row">
              <div className="col-sm-4">
                { this.props.book.url &&
                  <CatalogLink
                    className="btn btn-link"
                    target="_blank"
                    bookUrl={this.props.book.url}>
                    Permalink
                  </CatalogLink>
                }
              </div>
              <div className="col-sm-4" style={{textAlign: "center", marginBottom: "30px"}}>
                { circLink }
              </div>
              <div className="col-sm-4" style={{ textAlign: "right" }}>
              { reportUrl &&
                <ReportProblemLink
                  className="btn btn-link"
                  reportUrl={reportUrl}>
                </ReportProblemLink>
              }
              </div>
            </div>
            <div
              className="bookDetailsSummary"
              dangerouslySetInnerHTML={{ __html: this.props.book.summary }}>
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.setBodyOverflow("hidden");
  }

  componentWillUnmount() {
    this.setBodyOverflow("visible");
  }

  setBodyOverflow(value: string) {
    let elem = document.getElementsByTagName("body")[0] as HTMLElement;

    if (elem) {
      elem.style.overflow = value;
    }
  }

  circulationLink() {
    if (this.props.book.borrowUrl) {
      return (
        <BorrowButton
          className="btn btn-default"
          book={this.props.book}
          borrow={this.props.borrowAndFulfillBook}>
          Borrow
        </BorrowButton>
      );
    } else if (this.props.book.openAccessUrl) {
      return (
        <a
          className="btn btn-default"
          style={{ marginRight: "0.5em" }}
          href={this.props.book.openAccessUrl}
          target="_blank">
          Download
        </a>
      );
    }
  }

  audience() {
    let categories = this.props.book.raw.category;

    if (!categories) {
      return null;
    }

    let audience = categories.find(category =>
      category["$"]["scheme"]["value"] === "http://schema.org/audience"
    );

    if (!audience) {
      return null;
    }

    let audienceStr = audience["$"]["label"]["value"];

    if (["Adult", "Adults Only"].indexOf(audienceStr) !== -1) {
      return audienceStr;
    }

    let targetAge = categories.find(category =>
      category["$"]["scheme"]["value"] === "http://schema.org/typicalAgeRange"
    );

    if (targetAge) {
      let targetAgeStr = targetAge["$"]["label"]["value"];
      audienceStr += " (age " + targetAgeStr + ")";
    }

    return audienceStr;
  }

  categories() {
    let audienceSchemas = [
      "http://schema.org/audience",
      "http://schema.org/typicalAgeRange"
    ];
    let fictionScheme = "http://librarysimplified.org/terms/fiction/";
    let rawCategories = this.props.book.raw.category;

    let categories = rawCategories.filter(category =>
      audienceSchemas.concat([fictionScheme])
        .indexOf(category["$"]["scheme"]["value"]) === -1
    ).map(category => category["$"]["label"]["value"]);

    if (!categories.length) {
      categories = rawCategories.filter(category =>
        category["$"]["scheme"]["value"] === fictionScheme
      ).map(category => category["$"]["label"]["value"]);
    }

    return categories;
  }

  reportUrl() {
    let reportLink = this.props.book.raw.link.find(link =>
      link["$"]["rel"]["value"] === "issues"
    );

    if (!reportLink) {
      return null;
    }

    return reportLink["$"]["href"]["value"];
  }
}
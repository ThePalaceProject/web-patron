import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import { fetchComplaintTypes, postComplaint } from "../actions";
import DefaultBookDetails, { BookDetailsProps as DefaultBooKDetailsProps } from "opds-web-client/lib/components/BookDetails";
import ReportProblemLink from "./ReportProblemLink";
import { ComplaintData } from "../interfaces";
import { State } from "../reducers/index";

export interface BookDetailsProps extends DefaultBooKDetailsProps {
  problemTypes: string[];
  fetchComplaintTypes: (url: string) => Promise<string[]>;
  postComplaint: (url: string, data: ComplaintData) => Promise<any>;
}

export class BookDetails extends DefaultBookDetails<BookDetailsProps> {
  fieldNames() {
    return ["Published", "Publisher", "Audience", "Categories"];
  }

  fields() {
    let fields = super.fields();
    fields["Categories"] = this.categories();
    fields["Audience"] = this.audience();
    return fields;
  }

  audience() {
    if (!this.props.book) {
      return null;
    }

    let categories = this.props.book.raw.category;

    if (!categories) {
      return null;
    }

    let audience = categories.find(category =>
      category["$"]["scheme"] && category["$"]["scheme"]["value"] === "http://schema.org/audience"
    );

    if (!audience) {
      return null;
    }

    let audienceStr = audience["$"]["label"] && audience["$"]["label"]["value"];

    if (["Adult", "Adults Only"].indexOf(audienceStr) !== -1) {
      return audienceStr;
    }

    let targetAge = categories.find(category =>
      category["$"]["scheme"] && category["$"]["scheme"]["value"] === "http://schema.org/typicalAgeRange"
    );

    if (targetAge) {
      let targetAgeStr = targetAge["$"]["label"] && targetAge["$"]["label"]["value"];
      audienceStr += " (age " + targetAgeStr + ")";
    }

    return audienceStr;
  }

  categories() {
    if (!this.props.book) {
      return null;
    }

    let audienceSchemas = [
      "http://schema.org/audience",
      "http://schema.org/typicalAgeRange"
    ];
    let fictionScheme = "http://librarysimplified.org/terms/fiction/";
    let rawCategories = this.props.book.raw.category;

    let categories = rawCategories.filter(category =>
      category["$"]["label"] && category["$"]["scheme"] &&
          audienceSchemas.concat([fictionScheme])
              .indexOf(category["$"]["scheme"]["value"]) === -1
    ).map(category => category["$"]["label"]["value"]);

    if (!categories.length) {
      categories = rawCategories.filter(category =>
        category["$"]["label"] && category["$"]["scheme"] &&
            category["$"]["scheme"]["value"] === fictionScheme
      ).map(category => category["$"]["label"]["value"]);
    }

    return categories.length > 0 ? categories.join(", ") : null;
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

  rightColumnLinks() {
    let reportUrl = this.reportUrl();
    return reportUrl ?
      <ReportProblemLink
        className="btn btn-link"
        reportUrl={reportUrl}
        fetchTypes={this.props.fetchComplaintTypes}
        report={this.props.postComplaint}
        types={this.props.problemTypes}
        /> : null;
  }
}

function mapStateToProps(state: State, ownProps) {
  return {
    problemTypes: state.complaints.types
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchComplaintTypes: (url: string) => dispatch(fetchComplaintTypes(url)),
    postComplaint: (url: string, data: FormData) => dispatch(postComplaint(url, data))
  };
}

const ConnectedBookDetails = connect(
  mapStateToProps,
  mapDispatchToProps
)(BookDetails);

export default ConnectedBookDetails;
/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import { fetchComplaintTypes, postComplaint } from "../../actions";
import DefaultBookDetails, {
  BookDetailsProps as DefaultBooKDetailsProps
} from "opds-web-client/lib/components/BookDetails";
import ReportProblemLink from "../../components/ReportProblemLink";
import RevokeButton from "../../components/RevokeButton";
import { ComplaintData, SetCollectionAndBook } from "../../interfaces";
import BookCover from "../../components/BookCover";
import useTypedSelector from "../../hooks/useTypedSelector";
import Recommendations from "./recommendations";
import {
  mapDispatchToProps,
  mapStateToProps,
  mergeRootProps
} from "opds-web-client/lib/components/mergeRootProps";
import { BookData } from "opds-web-client/lib/interfaces";
import { connect } from "react-redux";
import ExternalLink from "../../components/ExternalLink";
import useSetCollectionAndBook from "../../hooks/useSetCollectionAndBook";
import { PageLoader } from "../../components/LoadingIndicator";
import DownloadCard from "./DownloadCard";

export interface BookDetailsPropsNew extends DefaultBooKDetailsProps {
  setCollectionAndBook: SetCollectionAndBook;
}

export const sidebarWidth = 200;

const BookDetailsNew: React.FC<BookDetailsPropsNew> = ({
  setCollectionAndBook
}) => {
  // set the collection and book
  useSetCollectionAndBook(setCollectionAndBook);

  const bookState = useTypedSelector(state => state.book);
  const { data: book } = bookState;

  if (!book) return <PageLoader />;

  return (
    <div>
      <Breadcrumbs />
      <div
        sx={{
          variant: "cards.bookDetails",
          border: "1px solid",
          borderColor: "blues.dark",
          borderRadius: "card",
          p: [2, 4]
        }}
      >
        <div id="top" sx={{ display: "flex" }}>
          {/* side bar */}
          <div
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              maxWidth: sidebarWidth
            }}
          >
            <BookCover book={bookState.data} sx={{ m: 2 }} />
            {/* download requirements & download links */}
            <DownloadCard
              sx={{ m: 2, display: ["none", "none", "block"] }}
              book={book}
            />
            <DownloadRequirements
              sx={{ m: 2, display: ["none", "none", "block"] }}
            />
          </div>

          {/* title, details, summary */}
          <div sx={{ flex: 2, m: 2 }}>
            <Styled.h1
              sx={{
                variant: "text.bookTitle",
                lineHeight: [0.7],
                letterSpacing: [1.4],
                my: [3],
                fontSize: [5, 5, 6]
              }}
            >
              {book.title}
              {book.subtitle && `: ${book.subtitle}`}
            </Styled.h1>
            <Styled.h3 sx={{ color: "primary", fontSize: [2, 2, 3] }}>
              By {book.authors?.join(", ") ?? "Unknown"}
            </Styled.h3>
            <DetailField heading="Publisher" details={book.publisher} />
            <DetailField heading="Published" details={book.published} />
            <DetailField
              heading="Categories"
              details={book.categories?.join(", ")}
            />
            <Summary sx={{ display: ["none", "none", "block"] }} book={book} />
          </div>
        </div>
        {/* the summary is displayed below when on small screens */}
        <Summary book={book} sx={{ display: ["block", "block", "none"] }} />
        {/* the download requirements are displayed below on small screens */}
        <div
          sx={{
            display: ["flex", "flex", "none"],
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <DownloadRequirements sx={{ m: 2 }} />
          <DownloadCard book={book} sx={{ m: 2 }} />
        </div>
      </div>
      <Recommendations book={book} />
    </div>
  );
};

const Summary: React.FC<{ book: BookData; className?: string }> = ({
  book,
  className
}) => (
  <div sx={{ m: 2 }} className={className}>
    <Styled.h2>Summary</Styled.h2>
    <div
      dangerouslySetInnerHTML={{
        __html: book.summary ?? "Summary not provided."
      }}
    />
  </div>
);

const DownloadRequirements: React.FC<{ className?: string }> = ({
  className
}) => {
  return (
    <div
      sx={{
        border: "1px solid",
        borderColor: "blues.primary",
        backgroundColor: "lightGrey",
        borderRadius: "card",
        display: "flex",
        flexDirection: "column",
        // alignItems: "center",
        py: 2,
        px: 3,
        maxWidth: sidebarWidth
      }}
      className={className}
    >
      <Styled.h5 sx={{ m: 0, mb: 2 }}>Download Requirements:</Styled.h5>
      <ol sx={{ m: 0, p: 0, pl: 3, fontSize: 1 }}>
        <li>
          <ExternalLink href="https://accounts.adobe.com/">
            Create Adobe ID
          </ExternalLink>
        </li>
        <li>
          Install an eBook Reader:
          <br />
          <ExternalLink href="https://www.adobe.com/solutions/ebook/digital-editions/download.html">
            Adobe Digital Editions
          </ExternalLink>
          <br />
          <ExternalLink href="">Bluefire Reader</ExternalLink>
          <br />
          <span>* Or another Adobe-compatible application</span>
        </li>
      </ol>
    </div>
  );
};

const DetailField: React.FC<{ heading: string; details?: string }> = ({
  heading,
  details
}) =>
  details ? (
    <div sx={{ fontSize: 1 }}>
      <b>{heading}: </b>
      <span>{details}</span>
    </div>
  ) : null;

const Connected = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
)(BookDetailsNew);

// am doing this because typescript throws an error when trying to use
// redux ConnectedComponent inside of Route
const Wrapper = props => <Connected {...props} />;
export default Wrapper;

const Breadcrumbs: React.FC<{}> = () => {
  return (
    <nav
      sx={{
        backgroundColor: "blues.dark",
        color: "white",
        textTransform: "uppercase",
        p: 2
      }}
    >
      hi from breadcrumbs
    </nav>
  );
};

// export interface BookDetailsProps extends DefaultBooKDetailsProps {
//   problemTypes: string[];
//   fetchComplaintTypes: (url: string) => Promise<string[]>;
//   postComplaint: (url: string, data: ComplaintData) => Promise<any>;
// }

// export class BookDetails extends DefaultBookDetails<BookDetailsProps> {
//   constructor(props) {
//     super(props);
//     this.revoke = this.revoke.bind(this);
//   }

//   fieldNames() {
//     return [
//       "Published",
//       "Publisher",
//       "Audience",
//       "Categories",
//       "Distributed By"
//     ];
//   }

//   // override the inherited setBodyOverflow so that it does nothing.
//   setBodyOverflow(value: string) {
//     return;
//   }

//   fields() {
//     const fields = super.fields();
//     const categoriesIndex = fields.findIndex(
//       field => field.name === "Categories"
//     );
//     fields[categoriesIndex].value = this.categories();
//     fields.push({
//       name: "Audience",
//       value: this.audience()
//     });
//     fields.push({
//       name: "Distributed By",
//       value: this.distributor()
//     });
//     return fields;
//   }

//   audience() {
//     if (!this.props.book) {
//       return null;
//     }

//     const categories = this.props.book.raw.category;

//     if (!categories) {
//       return null;
//     }

//     const audience = categories.find(
//       category =>
//         category["$"]["scheme"] &&
//         category["$"]["scheme"]["value"] === "http://schema.org/audience"
//     );

//     if (!audience) {
//       return null;
//     }

//     let audienceStr = audience["$"]["label"] && audience["$"]["label"]["value"];

//     if (["Adult", "Adults Only"].indexOf(audienceStr) !== -1) {
//       return audienceStr;
//     }

//     const targetAge = categories.find(
//       category =>
//         category["$"]["scheme"] &&
//         category["$"]["scheme"]["value"] === "http://schema.org/typicalAgeRange"
//     );

//     if (targetAge) {
//       const targetAgeStr =
//         targetAge["$"]["label"] && targetAge["$"]["label"]["value"];
//       audienceStr += " (age " + targetAgeStr + ")";
//     }

//     return audienceStr;
//   }

//   categories() {
//     if (!this.props.book) {
//       return null;
//     }

//     const audienceSchemas = [
//       "http://schema.org/audience",
//       "http://schema.org/typicalAgeRange"
//     ];
//     const fictionScheme = "http://librarysimplified.org/terms/fiction/";
//     const rawCategories = this.props.book.raw.category;

//     let categories = rawCategories
//       .filter(
//         category =>
//           category["$"]["label"] &&
//           category["$"]["scheme"] &&
//           audienceSchemas
//             .concat([fictionScheme])
//             .indexOf(category["$"]["scheme"]["value"]) === -1
//       )
//       .map(category => category["$"]["label"]["value"]);

//     if (!categories.length) {
//       categories = rawCategories
//         .filter(
//           category =>
//             category["$"]["label"] &&
//             category["$"]["scheme"] &&
//             category["$"]["scheme"]["value"] === fictionScheme
//         )
//         .map(category => category["$"]["label"]["value"]);
//     }

//     return categories.length > 0 ? categories.join(", ") : null;
//   }

//   distributor() {
//     if (!this.props.book) {
//       return null;
//     }

//     const rawDistributionTags = this.props.book.raw["bibframe:distribution"];
//     if (!rawDistributionTags || rawDistributionTags.length < 1) {
//       return null;
//     }

//     const distributor = rawDistributionTags[0]["$"]["bibframe:ProviderName"];
//     if (!distributor) {
//       return null;
//     }

//     return distributor.value;
//   }

//   reportUrl() {
//     const reportLink = this.props.book.raw.link.find(
//       link => link["$"]["rel"]["value"] === "issues"
//     );

//     if (!reportLink) {
//       return null;
//     }

//     return reportLink["$"]["href"]["value"];
//   }

//   revokeUrl() {
//     const revokeLink = this.props.book.raw.link.find(
//       link =>
//         link["$"]["rel"]["value"] ===
//         "http://librarysimplified.org/terms/rel/revoke"
//     );

//     if (!revokeLink) {
//       return null;
//     }

//     return revokeLink["$"]["href"]["value"];
//   }

//   revoke() {
//     const revokeUrl = this.revokeUrl();
//     return this.props.updateBook(revokeUrl);
//   }

//   circulationLinks() {
//     const links = super.circulationLinks();
//     if (this.isBorrowed()) {
//       links.push(
//         <div className="app-info">
//           Your book is ready to download in your reading app.
//         </div>
//       );
//     }

//     // Books with DRM can only be returned through Adobe,
//     // so we don't show revoke links for them.
//     if (this.isOpenAccess() && this.revokeUrl()) {
//       links.push(
//         <RevokeButton
//           className="btn btn-default revoke-button"
//           revoke={this.revoke}
//         >
//           Return Now
//         </RevokeButton>
//       );
//     }
//     return links;
//   }

//   rightColumnLinks() {
//     const reportUrl = this.reportUrl();
//     return reportUrl ? (
//       <ReportProblemLink
//         className="btn btn-link"
//         reportUrl={reportUrl}
//         fetchTypes={this.props.fetchComplaintTypes}
//         report={this.props.postComplaint}
//         types={this.props.problemTypes}
//       />
//     ) : null;
//   }

//   render() {
//     return (
//       <div
//         sx={{
//           bg: "papayawhip"
//         }}
//       >
//         <BookCover />
//       </div>
//     );
//   }
// }

// function mapStateToProps(state: State, ownProps) {
//   return {
//     problemTypes: state.complaints.types
//   };
// }

// function mapDispatchToProps(dispatch) {
//   return {
//     fetchComplaintTypes: (url: string) => dispatch(fetchComplaintTypes(url)),
//     postComplaint: (url: string, data: ComplaintData) =>
//       dispatch(postComplaint(url, data))
//   };
// }

// export default BookDetails;

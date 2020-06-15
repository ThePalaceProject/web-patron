/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { SetCollectionAndBook } from "../../interfaces";
import BookCover from "../BookCover";
import Recommendations from "./Recommendations";
import {
  mapDispatchToProps,
  mapStateToProps,
  mergeRootProps
} from "opds-web-client/lib/components/mergeRootProps";
import { BookData, FetchErrorData } from "opds-web-client/lib/interfaces";
import { connect } from "react-redux";
import ExternalLink from "../ExternalLink";
import useSetCollectionAndBook from "../../hooks/useSetCollectionAndBook";
import { PageLoader } from "../LoadingIndicator";
import FulfillmentCard from "./FulfillmentCard";
import BreadcrumbBar from "../BreadcrumbBar";
import truncateString from "../../utils/truncate";
import useNormalizedBook from "../../hooks/useNormalizedBook";
import DetailField from "../BookMetaDetail";
import ReportProblem from "./ReportProblem";
import useTypedSelector from "../../hooks/useTypedSelector";
import { NavButton } from "../Button";
import Head from "next/head";
import { H2, H3, Text, H1 } from "components/Text";
import MediumIndicator from "components/MediumIndicator";

/**
 * How will I build my grid?
 *  - Margin: 64px (when does this go away / change?). This should change for the whole layout at some point for mobile.
 *  - 12 columns. Each element decides how many columns it takes up...
 *  - Every column except the last gets 32px padding right
 *  - How do you deal with the extra columns on the side?
 */

const Grid: React.FC = ({ children, ...rest }) => (
  <div
    sx={{
      display: "flex",
      mx: 5,
      "&>div": {
        mr: 4
      },
      "&>div:last-child": {
        mr: 0
      }
    }}
    {...rest}
  >
    {children}
  </div>
);

const Column: React.FC<{ columns: number }> = ({
  children,
  columns,
  ...rest
}) => (
  <div sx={{ flex: columns / 12 }} {...rest}>
    {children}
  </div>
);

export const BookDetails: React.FC<{
  setCollectionAndBook: SetCollectionAndBook;
}> = ({ setCollectionAndBook }) => {
  // set the collection and book
  useSetCollectionAndBook(setCollectionAndBook);

  const book = useNormalizedBook();

  const error = useTypedSelector(state => state.book.error);

  if (error) {
    return <Error error={error} />;
  }
  if (!book) return <PageLoader />;
  return (
    <section aria-label="Book details">
      <Head>
        <title>{book.title}</title>
      </Head>
      <BreadcrumbBar currentLocation={truncateString(book.title, 20, false)} />
      <Grid sx={{ my: 4 }}>
        <Column columns={1} />
        <Column columns={4}>
          <BookCover book={book} />
          {/* download requirements & download links */}
          <DownloadRequirements />
        </Column>
        <Column columns={8} aria-label="Book info">
          <H1 sx={{ m: 0 }}>
            {book.title}
            {book.subtitle && `: ${book.subtitle}`}
          </H1>

          <Text
            variant="text.callouts.regular"
            sx={{ color: "brand.secondary" }}
          >
            <span sx={{ color: "ui.black" }}>by </span>
            {book.authors?.join(", ") ?? "Unknown"}
          </Text>
          <MediumIndicator book={book} />
          <div sx={{ mt: 2 }}>
            <DetailField heading="Publisher" details={book.publisher} />
            <DetailField heading="Published" details={book.published} />
            <DetailField
              heading="Categories"
              details={book.categories?.join(", ")}
            />
          </div>
          <FulfillmentCard book={book} sx={{ mt: 3 }} />
          <ReportProblem book={book} />
          <Summary sx={{ display: ["none", "none", "block"] }} book={book} />
        </Column>
        <Column columns={1} />
      </Grid>
      {/* <Recommendations book={book} /> */}
    </section>
  );
};

const Summary: React.FC<{ book: BookData; className?: string }> = ({
  book,
  className
}) => (
  <div sx={{ my: 2 }} className={className} aria-label="Book summary">
    <H3 sx={{ mb: 2 }}>Summary</H3>
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
    <section
      aria-label="Download requirements"
      sx={{
        mt: 4,
        bg: "ui.gray.lightWarm",
        display: "flex",
        flexDirection: "column",
        py: 2,
        px: 3
      }}
      className={className}
    >
      <h3 id="requirements-header" sx={{ fontSize: 2, m: 0, mb: 2 }}>
        Download Requirements:
      </h3>
      <ol
        sx={{ m: 0, p: 0, pl: 3, fontSize: 1 }}
        aria-labelledby="requirements-header"
      >
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
          <ExternalLink href="http://www.bluefirereader.com/bluefire-reader.html">
            Bluefire Reader
          </ExternalLink>
          <br />
          <span>* Or another Adobe-compatible application</span>
        </li>
      </ol>
    </section>
  );
};

const Error: React.FC<{ error: FetchErrorData }> = ({ error }) => {
  let detail: string;
  try {
    detail = JSON.parse(error.response).detail;
  } catch {
    detail = error.response;
  }
  return (
    <section
      aria-label="Book details"
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Head>
        <title>Book error</title>
      </Head>
      <div sx={{ maxWidth: "70%" }}>
        <p>
          There was a problem fetching this book. Please refresh the page or
          return home.
        </p>
        <div>
          <span sx={{ fontWeight: "bold" }}>Error Code: </span>
          {error.status ?? "unknown"}
        </div>
        <div>
          <span sx={{ fontWeight: "bold" }}>Error Message: </span>
          {detail}
        </div>
        <NavButton sx={{ mt: 3 }} href="/">
          Return Home
        </NavButton>
      </div>
    </section>
  );
};

const Connected = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
)(BookDetails);

// am doing this because typescript throws an error when trying to use
// redux ConnectedComponent inside of Route
export default Connected;

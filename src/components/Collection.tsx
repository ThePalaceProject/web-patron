/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import useTypedSelector from "../hooks/useTypedSelector";
import { SetCollectionAndBook } from "../interfaces";
import useSetCollectionAndBook from "../hooks/useSetCollectionAndBook";
import { connect } from "react-redux";
import {
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
} from "opds-web-client/lib/components/mergeRootProps";
import { PageLoader } from "../components/LoadingIndicator";
import Lane from "../components/Lane";
import Book from "./BookCard";
import { BookData } from "opds-web-client/lib/interfaces";
import BreadcrumbBar from "./BreadcrumbBar";
import truncateString from "../utils/truncate";
import BookCover from "./BookCover";
import Link from "./Link";
import { useGetCatalogLink } from "../hooks/useCatalogLink";
import { getAuthors } from "../utils/book";

const Collection: React.FC<{ setCollectionAndBook: SetCollectionAndBook }> = ({
  setCollectionAndBook
}) => {
  // set collection and book
  useSetCollectionAndBook(setCollectionAndBook);

  const collection = useTypedSelector(state => state.collection);

  if (collection.isFetching) {
    return <PageLoader />;
  }

  const hasLanes = (collection?.data?.lanes?.length ?? 0) > 1;
  const hasBooks = (collection?.data?.books?.length ?? 0) > 1;

  if (hasLanes) {
    const lanes = collection?.data?.lanes ?? [];
    return (
      <div>
        {lanes.map(lane => (
          <Lane key={lane.url} lane={lane} />
        ))}
      </div>
    );
  } else if (hasBooks) {
    const books = collection?.data?.books ?? [];
    return <GalleryView books={books} />;
  }

  // otherwise it it empty
  return (
    <div
      sx={{
        display: "flex",
        flex: "1 1 auto",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Styled.h3 sx={{ color: "primaries.medium", fontStyle: "italic" }}>
        This collection is empty.
      </Styled.h3>
    </div>
  );
};

const GalleryView: React.FC<{ books: BookData[] }> = ({ books }) => {
  return (
    <div>
      <BreadcrumbBar>hi from bread</BreadcrumbBar>
      <ul
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "stretch",
          justifyContent: "center",
          p: 0,
          m: 0
        }}
      >
        {books.map(book => (
          <Book key={book.id} book={book} sx={{ my: 3, mx: 3 }} />
        ))}
      </ul>
    </div>
  );
};

const ListView: React.FC<{ books: BookData[] }> = ({ books }) => {
  const getCatalogLink = useGetCatalogLink();

  return (
    <React.Fragment>
      <BreadcrumbBar>hi from breadcrumbs</BreadcrumbBar>
      <ul sx={{ p: 0, m: 0 }}>
        {books.map(book => (
          <li
            key={book.id}
            sx={{
              listStyle: "none",
              border: "1px solid",
              borderColor: "blues.dark",
              borderRadius: "card",
              height: 200,
              display: "flex",
              alignItems: "center",
              p: 4,
              m: [3, 4]
            }}
          >
            <BookCover book={book} sx={{ width: 100, height: 150 }} />
            <div sx={{ alignSelf: "flex-start", ml: 3 }}>
              <Link to={getCatalogLink(book.url)}>
                <Styled.h2 sx={{ my: 2, variant: "text.bookTitle" }}>
                  {truncateString(book.title, 50, true)}
                </Styled.h2>
              </Link>
              <Styled.h3 sx={{ color: "primary", fontSize: [2, 2, 3] }}>
                {getAuthors(book, 2).join(", ")}
              </Styled.h3>
            </div>
          </li>
        ))}
      </ul>
    </React.Fragment>
  );
};

const Connected = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeRootProps
)(Collection);

// // we have to do this due to a typing error in react-router-dom
const Wrapper = props => <Connected {...props} />;
export default Wrapper;

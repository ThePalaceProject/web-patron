/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import book from "opds-web-client/lib/reducers/book";
import { BookData, LaneData } from "opds-web-client/lib/interfaces";
import { useActions } from "../context/ActionsContext";
import useRecommendationsState from "../context/RecommendationsContext";
import BookCover from "../BookCover";

const Recommendations: React.FC<{ book: BookData }> = ({ book }) => {
  /**
   * TODO
   * - show fetching indicator
   * - handle multiple lanes
   */
  const relatedUrl = getRelatedUrl(book);
  const {
    recommendationsState,
    recommendationsDispatch,
    recommendationsActions
  } = useRecommendationsState();

  // fetch the collection
  React.useEffect(() => {
    recommendationsDispatch(recommendationsActions.fetchCollection(relatedUrl));

    /**
     * This will be run on unmount, and before running the effect anytime
     * it is going to run.
     */
    return () => {
      recommendationsDispatch(recommendationsActions.clearCollection());
    };
    // will run on mount and anytime the relatedUrl changes.
    // other dependencies should never change.
  }, [recommendationsDispatch, recommendationsActions, relatedUrl]);

  // get the lanes data from state
  const lanes = recommendationsState?.data?.lanes ?? [];
  const isFetching = recommendationsState?.isFetching ?? false;

  // console.log(lanes);

  return (
    <React.Fragment>
      {lanes.map(lane => (
        <Lane key={lane.title} lane={lane} selfId={book.id} />
      ))}
    </React.Fragment>
  );
};

const Lane: React.FC<{ lane: LaneData; selfId: string }> = ({
  selfId,
  lane: { title, books }
}) => {
  // if there are less than two books, show nothing
  if (books.length < 2) return null;

  return (
    <div sx={{ variant: "cards.bookDetails", border: "none" }}>
      <Styled.h4>{title}</Styled.h4>
      <div
        sx={{
          border: "1px solid",
          borderColor: "blues.dark",
          borderRadius: "card",
          p: 3
        }}
      >
        {books.map(
          book =>
            book.id !== selfId && (
              <div key={book.id} sx={{ maxWidth: 100 }}>
                <BookCover book={book} />
              </div>
            )
        )}
      </div>
    </div>
  );
};

const getRelatedUrl = (book: BookData): null | string => {
  if (!book) return null;

  const links = book.raw.link;
  if (!links) return null;

  const relatedLink = links.find(link => link.$.rel.value === "related");
  if (!relatedLink) return null;

  return relatedLink.$.href.value;
};

export default Recommendations;

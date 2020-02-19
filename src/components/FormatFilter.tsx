/** @jsx jsx */
import { jsx, Flex } from "theme-ui";
import * as React from "react";
import useTypedSelector from "../hooks/useTypedSelector";
import { useHistory, Route, useRouteMatch } from "react-router-dom";
import useCatalogLink from "../hooks/useCatalogLink";
import { Book, Headset } from "../icons";
import FilterButton from "./FilterButton";

/**
 * This filter depends on the "Formats" facetGroup, which should have
 * at least two facets with labels:
 *  - Audiobooks
 *  - eBooks
 * It can optionally have an additional "All" facet. Note that the facet
 * labels must match the spelling and capitalization exactly.
 */
const FormatFilter: React.FC = () => {
  const formatFacetGroup = useTypedSelector(state =>
    state.collection.data?.facetGroups?.find(
      facetGroup => facetGroup.label === "Formats"
    )
  );
  const ebookFacet = formatFacetGroup?.facets.find(
    facet => facet.label === "eBooks"
  );
  const audiobookFacet = formatFacetGroup?.facets.find(
    facet => facet.label === "Audiobooks"
  );
  const allFacet = formatFacetGroup?.facets.find(
    facet => facet.label === "All"
  );

  const history = useHistory();

  const audioBookUrl = useCatalogLink(undefined, audiobookFacet?.href);
  const ebookFacetUrl = useCatalogLink(undefined, ebookFacet?.href);
  const allFacetUrl = useCatalogLink(undefined, allFacet?.href);

  if (!ebookFacet || !audiobookFacet) return null;
  return (
    <Route path={["/", "/collection/:collectionUrl"]} exact>
      <Flex sx={{ py: 0 }}>
        {allFacet && (
          <FilterButton
            onClick={() => allFacet.href && history.push(allFacetUrl)}
            selected={allFacet.active}
          >
            ALL
          </FilterButton>
        )}
        <FilterButton
          onClick={() => ebookFacet.href && history.push(ebookFacetUrl)}
          selected={!!ebookFacet.active}
        >
          <Book sx={{ fontSize: 4 }} />
        </FilterButton>
        <FilterButton
          onClick={() => audiobookFacet.href && history.push(audioBookUrl)}
          selected={!!audiobookFacet.active}
        >
          <Headset sx={{ fontSize: 4, m: 0, p: 0 }} />
        </FilterButton>
      </Flex>
    </Route>
  );
};
export default FormatFilter;

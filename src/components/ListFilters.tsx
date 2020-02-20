/** @jsx jsx */
import { jsx, Flex } from "theme-ui";
import * as React from "react";
import useTypedSelector from "../hooks/useTypedSelector";
import { useHistory, Route, useRouteMatch } from "react-router-dom";
import useCatalogLink, { useGetCatalogLink } from "../hooks/useCatalogLink";
import { Book, Headset } from "../icons";
import FilterButton from "./FilterButton";
import { FacetGroupData } from "opds-web-client/lib/interfaces";

/**
 * This filter depends on the "Formats" facetGroup, which should have
 * at least two facets with labels:
 *  - Audiobooks
 *  - eBooks
 * It can optionally have an additional "All" facet. Note that the facet
 * labels must match the spelling and capitalization exactly.
 */
const ListFilters: React.FC = () => {
  return (
    <div sx={{ display: "flex", alignItems: "center" }}>
      <FacetSelector facetLabel="Sort by" />
      <FacetSelector facetLabel="Availability" />
    </div>
  );
};

const FacetSelector: React.FC<{ facetLabel: string }> = ({ facetLabel }) => {
  const facetGroup = useTypedSelector(state =>
    state.collection.data?.facetGroups?.find(
      facetGroup => facetGroup.label === facetLabel
    )
  );
  const history = useHistory();
  const getCatalogLink = useGetCatalogLink();

  console.log(facetGroup);
  if (!facetGroup) return null;

  const { label, facets } = facetGroup;

  const activeFacet = facets.find(facet => !!facet.active);

  const handleChange = (e: React.FormEvent<HTMLSelectElement>) => {
    // just navigate to that facet.
    const facetLabel = e.currentTarget.value;
    const facet = facets.find(facet => facet.label === facetLabel);

    if (facet?.href) history.push(getCatalogLink(undefined, facet.href));
  };
  return (
    <React.Fragment>
      <label htmlFor={`facet-selector-${label}`} sx={{ ml: 3, mr: 2 }}>
        {label}
      </label>
      <select
        id={`facet-selector-${label}`}
        value={activeFacet?.label}
        onBlur={handleChange}
        onChange={handleChange}
      >
        {facets.map(facet => (
          <option key={facet.label} value={facet.label}>
            {facet.label}
          </option>
        ))}
      </select>
    </React.Fragment>
  );
};
export default ListFilters;

import * as React from "react";
import Select from "./Select";
import Router from "next/router";
import { CollectionData, FacetGroupData } from "interfaces";
import FormLabel from "components/form/FormLabel";
import useLinkUtils from "hooks/useLinkUtils";
import { useTranslation } from "next-i18next/pages";
import { translateFacetGroup } from "utils/facets";

const ListFilters: React.FC<{ collection: CollectionData }> = ({
  collection
}) => {
  const { facetGroups } = collection;
  return (
    <div
      sx={{
        display: "flex",
        flexDirection: ["column", "row"],
        flexWrap: "wrap"
      }}
    >
      {facetGroups?.map(facetGroup => (
        <FacetSelector facetGroup={facetGroup} key={facetGroup.label} />
      ))}
    </div>
  );
};

const FacetSelector: React.FC<{
  facetGroup: FacetGroupData;
}> = ({ facetGroup }) => {
  const linkUtils = useLinkUtils();
  const { t } = useTranslation();

  // use id over label for select element now that we're translating the label
  // id is stable across different locales
  const { id, label, facets } = translateFacetGroup(facetGroup, t);

  const activeFacet = facets.find(facet => !!facet.active);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // The option value is the facet's href, so we can just navigate to it.
    // Keying on the label might break now that labels are translated.
    const href = e.currentTarget.value;

    if (!href) return;
    const url = linkUtils.buildCollectionLink(href);
    // shallow route because we don't need to rerun getStaticProps for the new page,
    // just fetch the new collection client-side
    Router.push(url, undefined, { shallow: true });
  };
  return (
    <div sx={{ m: 1 }}>
      <FormLabel sx={{ mb: 0 }} htmlFor={`facet-selector-${id}`}>
        {label}
      </FormLabel>
      <Select
        id={`facet-selector-${id}`}
        value={activeFacet?.href}
        onBlur={handleChange}
        onChange={handleChange}
      >
        {facets.map(facet => (
          <option key={facet.href} value={facet.href}>
            {facet.label}
          </option>
        ))}
      </Select>
    </div>
  );
};
export default ListFilters;

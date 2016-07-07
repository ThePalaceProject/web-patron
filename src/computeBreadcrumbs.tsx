import { CollectionData, LinkData } from "opds-web-client/lib/interfaces";
import { hierarchyComputeBreadcrumbs } from "opds-web-client/lib/components/Breadcrumbs";

export default (collection: CollectionData, history: LinkData[]): LinkData[] => {
  let links = [];

  if (collection &&
      collection.raw &&
      collection.raw["simplified:breadcrumbs"] &&
      collection.raw["simplified:breadcrumbs"][0] &&
      collection.raw["simplified:breadcrumbs"][0].link
    ) {
    let rawLinks = collection.raw["simplified:breadcrumbs"][0].link;
    links = rawLinks.map(link => {
      return {
        url: link["$"].href.value,
        text: link["$"].title.value
      };
    });
    links.push({
      url: collection.url,
      text: collection.title
    });
  } else {
    links = hierarchyComputeBreadcrumbs(collection, history);
  }

  return links;
};
/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import {
  Link as BaseLink,
  LinkProps as RouterLinkProps
} from "react-router-dom";
import { useGetCatalogLink } from "../hooks/useCatalogLink";

type CatalogLinkProps = Omit<RouterLinkProps, "to"> & {
  collectionUrl?: string | null;
  bookUrl?: string | null;
};
type LinkProps = { ref?: React.Ref<any> } & (
  | RouterLinkProps
  | CatalogLinkProps
);

function isBaseLinkProps(props: LinkProps): props is RouterLinkProps {
  return !!(props as RouterLinkProps).to;
}
/**
 * Extends the react router link to:
 *  - add styles
 *  - allow user to optionally pass in a collectionUrl/bookUrl combo
 *    and let the link compute the "to" prop
 */
const Link: React.FC<LinkProps> = React.forwardRef(
  ({ ...props }: LinkProps, ref: React.Ref<any>) => {
    const getCatalogLink = useGetCatalogLink();
    const computedTo = isBaseLinkProps(props)
      ? props.to
      : getCatalogLink(props.bookUrl, props.collectionUrl);

    delete (props as CatalogLinkProps).collectionUrl;
    delete (props as CatalogLinkProps).bookUrl;

    return (
      <BaseLink
        to={computedTo}
        sx={{ textDecoration: "none", color: "inherit" }}
        ref={ref}
        {...props}
      />
    );
  }
);

export default Link;

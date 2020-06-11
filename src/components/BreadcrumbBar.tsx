/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import useBreadCrumbs from "../hooks/useBreadcrumbs";
import Link from "./Link";
import { Text } from "./Text";
import List, { ListItem } from "./List";

const BreadcrumbBar: React.FC<{
  className?: string;
  currentLocation?: string;
}> = ({ children, className, currentLocation }) => {
  const breadcrumbs = useBreadCrumbs();
  const lastItem = currentLocation ?? breadcrumbs.pop()?.text;
  return (
    <div
      className={className}
      sx={{
        backgroundColor: "brand.primary",
        color: "white",
        m: 0,
        p: 2,
        px: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <List
        sx={{
          display: "flex",
          alignItems: "center",
          variant: "lists.unstyled",
          fontSize: "-1"
        }}
      >
        {breadcrumbs.map(
          breadcrumb =>
            breadcrumb.text &&
            breadcrumb.url && (
              <ListItem key={breadcrumb.url}>
                <Link collectionUrl={breadcrumb.url}>
                  {breadcrumb.text} /&nbsp;
                </Link>
              </ListItem>
            )
        )}
        <ListItem>{lastItem}</ListItem>
      </List>
      {children}
    </div>
  );
};

export default BreadcrumbBar;

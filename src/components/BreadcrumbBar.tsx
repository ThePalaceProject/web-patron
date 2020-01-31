/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import * as React from "react";
import useBreadCrumbs from "../hooks/useBreadcrumbs";
import { ArrowRight } from "../icons";

/**
 * A simple UI component to provide consistent
 * styling for the breadcrumb bar used in multiple
 * places.
 */
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
        backgroundColor: "blues.dark",
        color: "white",
        m: 0,
        p: 2,
        textTransform: "uppercase",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <div sx={{ display: "flex", alignItems: "center" }}>
        {breadcrumbs.map(breadcrumb => (
          <Styled.h3
            key={breadcrumb.url}
            sx={{
              m: 0,
              display: "flex",
              alignItems: "center"
            }}
          >
            {breadcrumb.text} <ArrowRight sx={{ fill: "white" }} />
          </Styled.h3>
        ))}
        <Styled.h3 sx={{ m: 0, fontWeight: "light" }}>{lastItem}</Styled.h3>
      </div>
      {children}
    </div>
  );
};

export default BreadcrumbBar;

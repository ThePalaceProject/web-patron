/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

const DetailField: React.FC<{
  heading: string;
  hideHeading?: Boolean;
  details?: string;
}> = ({ heading, hideHeading = false, details }) =>
  details ? (
    <>
      <dt
        sx={{ variant: hideHeading ? "text.accessibility.visuallyHidden" : "" }}
      >
        <b>{heading}: </b>
      </dt>
      <dd style={{ marginLeft: hideHeading ? 0 : 10 }}>{details}</dd>
    </>
  ) : null;

export default DetailField;

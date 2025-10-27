/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

const DetailField: React.FC<{
  heading: string;
  details?: string;
}> = ({ heading, details }) =>
  details ? (
    <>
      <dt>
        <b>{heading}: </b>
      </dt>
      <dd style={{ marginLeft: 10 }}>{details}</dd>
    </>
  ) : null;

export default DetailField;

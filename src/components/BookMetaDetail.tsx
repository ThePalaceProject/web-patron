/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";

const DetailField: React.FC<{ heading: string; details?: string }> = ({
  heading,
  details,
  ...rest
}) =>
  details ? (
    <div {...rest}>
      <b>{heading}: </b>
      <span>{details}</span>
    </div>
  ) : null;

export default DetailField;

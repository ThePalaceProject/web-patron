import * as React from "react";

const DetailField: React.FC<{
  heading: string;
  details?: React.ReactNode;
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

import * as React from "react";
import ErrorComponent from "../components/Error";
import { NextPage } from "next";
import { OPDS1 } from "interfaces";
import track from "analytics/track";

const Error: NextPage<{
  errorInfo?: OPDS1.ProblemDocument;
}> = ({ errorInfo }) => {
  return <ErrorComponent info={errorInfo} />;
};

Error.getInitialProps = ({ res, err }) => {
  if (err) track.error(err);
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return {
    errorInfo: {
      status: statusCode,
      title: "Server Error",
      detail: "An unexpected error occurred on the server."
    }
  };
};

export default Error;

import * as React from "react";
import ErrorComponent from "../components/Error";
import { NextPage } from "next";
import { OPDS1 } from "interfaces";
import track from "analytics/track";
import ApplicationError from "errors";
import { useTranslation } from "next-i18next/pages";
import { getTranslationProps } from "dataflow/translationProps";
import { IS_SERVER } from "utils/env";

type ErrorPageProps = {
  errorInfo?: OPDS1.ProblemDocument;
  statusCode?: number;
};

const Error: NextPage<ErrorPageProps> = ({ errorInfo, statusCode }) => {
  const { t } = useTranslation();
  return (
    <ErrorComponent
      info={
        errorInfo ?? {
          status: statusCode,
          title: t(
            "error.pageRenderFailed",
            "Something went wrong rendering the page.",
            { ns: "common" }
          ),
          detail: t("error.unexpectedError", "An unexpected error occurred.", {
            ns: "common"
          })
        }
      }
    />
  );
};

Error.getInitialProps = async ({ res, err, locale }) => {
  if (err) track.error(err);

  const translationProps = IS_SERVER
    ? await getTranslationProps(locale).catch(() => ({}))
    : {};

  if (err instanceof ApplicationError) {
    return {
      errorInfo: err.info,
      ...translationProps
    };
  }
  return {
    statusCode: res?.statusCode ?? err?.statusCode ?? 500,
    ...translationProps
  };
};

export default Error;

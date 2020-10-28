import { LibraryData, OPDS1 } from "../interfaces";
import { GetStaticProps } from "next";
import {
  getAuthDocUrl,
  fetchAuthDocument,
  buildLibraryData
} from "dataflow/getLibraryData";
import ApplicationError, { PageNotFoundError } from "errors";
import extractParam from "dataflow/utils";
import track from "analytics/track";

export type AppProps = {
  library?: LibraryData;
  error?: OPDS1.ProblemDocument;
};

export default function withAppProps(
  pageGetServerSideProps?: GetStaticProps
): GetStaticProps<AppProps> {
  return async ctx => {
    try {
      const librarySlug = extractParam(ctx.params, "library");
      if (!librarySlug)
        throw new PageNotFoundError(
          "A library slug is required to be provided in the URL. Eg: https://domain.com/:library"
        );

      const authDocUrl = await getAuthDocUrl(librarySlug);
      const authDocument = await fetchAuthDocument(authDocUrl);
      const library = buildLibraryData(authDocument, librarySlug);
      // fetch the static props for the page
      const pageResult = (await pageGetServerSideProps?.(ctx)) ?? { props: {} };
      return {
        ...pageResult,
        props: {
          ...pageResult.props,
          library
        },
        // revalidate library-wide data once per hour per route
        revalidate: 60 * 60
      };
    } catch (e) {
      // show the error page if there was an ApplicationError
      if (e instanceof ApplicationError) {
        track.error(e, { severity: "error" });
        return {
          props: {
            error: e.info
          },
          // library data will be revalidated often for error pages.
          revalidate: 1
        };
      }
      // otherwise we probably can't recover at all,
      // so rethrow.
      throw e;
    }
  };
}

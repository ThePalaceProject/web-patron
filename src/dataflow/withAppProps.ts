import { AppConfig, LibraryData, OPDS1 } from "../interfaces";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetStaticProps,
  GetStaticPropsContext
} from "next";
import {
  getAuthDocUrl,
  fetchAuthDocument,
  buildLibraryData
} from "dataflow/getLibraryData";
import ApplicationError, { PageNotFoundError } from "errors";
import extractParam from "dataflow/utils";
import { ParsedUrlQuery } from "querystring";
import track from "analytics/track";
import { getAppConfig } from "server/appConfig";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export type AppProps = {
  library?: LibraryData;
  appConfig?: AppConfig;
  error?: OPDS1.ProblemDocument;
  _locale?: string;
};

/*
 * Resolves the library slug from the route params (or the provided default)
 * and builds the props every page needs: the app config and the library data
 * derived from the library's authentication document.
 */
async function getLibraryProps(
  params: ParsedUrlQuery | undefined,
  defaultLibSlug?: string
): Promise<{ library: LibraryData; appConfig: AppConfig }> {
  const librarySlug = defaultLibSlug
    ? defaultLibSlug
    : extractParam(params, "library");

  if (!librarySlug)
    throw new PageNotFoundError(
      "A library slug is required to be provided in the URL. Eg: https://domain.com/:library"
    );

  const appConfig = await getAppConfig();
  const authDocUrl = await getAuthDocUrl(librarySlug, appConfig);
  const authDocument = await fetchAuthDocument(
    authDocUrl,
    appConfig.authenticationDocuments ?? undefined
  );
  const library = buildLibraryData(authDocument, librarySlug);
  return { library, appConfig };
}

/*
 * Wraps an unknown thrown value in an ApplicationError if necessary, reports
 * it, and returns the problem document to render as an error page.
 */
function trackError(e: any): OPDS1.ProblemDocument {
  const error =
    e instanceof ApplicationError
      ? e
      : new ApplicationError(
          {
            title: "App Startup Failure",
            detail:
              e instanceof Error
                ? `${e.name}: ${e.message}`
                : "Unknown error occurred fetching page props",
            status: 500
          },
          e
        );
  track.error(error, { severity: "error" });
  return error.info;
}

export default function withAppProps(
  pageGetStaticProps?: GetStaticProps,
  defaultLibSlug?: string
): GetStaticProps<AppProps> {
  return async (ctx: GetStaticPropsContext<ParsedUrlQuery>) => {
    try {
      const { library, appConfig } = await getLibraryProps(
        ctx.params,
        defaultLibSlug
      );
      // fetch the static props for the page
      const pageResult = (await pageGetStaticProps?.(ctx)) ?? { props: {} };
      const pageProps = "props" in pageResult ? pageResult.props : {};

      // define the translation file namespaces
      const translationNamespaces = ["translations"];

      // define the current locale.
      // Use the locale from context,
      // or if is missing, use app's default locale
      const currentLocale = ctx.locale ?? "en";

      // fetch translations for the current locale from the server,
      // translationNamespaces is used for finding translation keys
      const translations = await serverSideTranslations(
        currentLocale,
        translationNamespaces
      );

      return {
        ...pageResult,
        props: {
          ...pageProps,
          library,
          appConfig,
          _locale: currentLocale,
          ...translations
        },
        // revalidate library-wide data once per hour per route
        revalidate: 60 * 60
      };
    } catch (e) {
      const error = trackError(e);
      /*
       * Unknown library slugs return notFound so Next.js serves its 404 page
       * without persisting a cache entry on disk for the junk path. Combined
       * with fallback: "blocking" on the pages using this wrapper, this keeps
       * arbitrary request paths from growing the incremental cache.
       */
      if (error.status === 404) {
        return { notFound: true, revalidate: 1 };
      }
      return {
        props: {
          error
        },
        // library data will be revalidated often for error pages.
        revalidate: 1
      };
    }
  };
}

/*
 * Per-request variant of withAppProps for pages whose dynamic param space is
 * unbounded (the route param embeds a backend feed or entry URL). These pages
 * must use getServerSideProps: statically generating them would persist a
 * cached page on disk for every unique URL visited.
 *
 * Responses keep Next's default no-store Cache-Control (no s-maxage), so
 * these pages are deliberately never cached — on disk or by a shared cache.
 */
export function withAppPropsSSR(
  pageGetServerSideProps?: GetServerSideProps,
  defaultLibSlug?: string
): GetServerSideProps<AppProps> {
  return async (ctx: GetServerSidePropsContext<ParsedUrlQuery>) => {
    try {
      const { library, appConfig } = await getLibraryProps(
        ctx.params,
        defaultLibSlug
      );
      const pageResult = (await pageGetServerSideProps?.(ctx)) ?? {
        props: {}
      };
      if ("redirect" in pageResult || "notFound" in pageResult) {
        return pageResult;
      }
      const pageProps = await pageResult.props;

      // define the translation file namespaces
      const translationNamespaces = ["translations"];

      // define the current locale.
      // Use the locale from context,
      // or if is missing, use app's default locale
      const currentLocale = ctx.locale ?? "en";

      // fetch translations for the current locale from the server,
      // translationNamespaces is used for finding translation keys
      const translations = await serverSideTranslations(
        currentLocale,
        translationNamespaces
      );

      return {
        props: {
          ...pageProps,
          library,
          appConfig,
          _locale: currentLocale,
          ...translations
        }
      };
    } catch (e) {
      const error = trackError(e);
      /*
       * Unknown library slugs render the custom 404 page, matching the static
       * wrapper's behavior. Next.js sets the 404 status automatically.
       */
      if (error.status === 404) {
        return { notFound: true };
      }
      ctx.res.statusCode = error.status ?? 500;
      return {
        props: {
          error
        }
      };
    }
  };
}

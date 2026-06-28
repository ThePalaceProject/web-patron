import { GetServerSidePropsResult } from "next";
import { ParsedUrlQuery } from "querystring";
import type { AppConfig } from "interfaces";
import { getAppConfig } from "server/appConfig";
import { getLibraries } from "server/libraryRegistry";
import {
  getAuthDocUrl,
  fetchAuthDocument,
  buildLibraryData
} from "dataflow/getLibraryData";
import { buildWorkUrl } from "utils/workUrl";

export interface ItemLandingProps {
  workId: string;
  /*
   * Included in pageProps so _app.tsx initializes Bugsnag and media support
   * from the real config instead of FALLBACK_APP_CONFIG.
   */
  appConfig: AppConfig;
}

/** Extracts the workId path param, joining segments if Next ever supplies an array. */
export function parseWorkId(params: ParsedUrlQuery | undefined): string {
  return Array.isArray(params?.workId)
    ? params.workId.join("/")
    : (params?.workId ?? "");
}

/**
 * Resolves server-side props for the /[library]/[workId] route, which serves
 * the item landing page when the first path segment matches one of the
 * configured item landing slugs and 404s otherwise. Multiple slugs all serve
 * the page so a deployment can migrate from one slug to another with both
 * active. This check runs before the segment is treated as a library, so a
 * library with a colliding slug is shadowed here; server/libraryRegistry.ts
 * logs a warning when it detects such a collision.
 */
export async function getItemLandingRouteProps(
  params: ParsedUrlQuery | undefined
): Promise<GetServerSidePropsResult<ItemLandingProps>> {
  const appConfig = await getAppConfig();
  const segment = params?.library;
  if (
    typeof segment !== "string" ||
    !appConfig.itemLandingSlugs.includes(segment)
  ) {
    return { notFound: true };
  }
  return getItemLandingProps(parseWorkId(params));
}

/**
 * Resolves server-side props for the cross-library item landing page. When
 * exactly one library is configured (or Open eBooks mode names a default),
 * redirects straight to that library's book page instead of rendering the
 * library selector.
 */
export async function getItemLandingProps(
  workId: string
): Promise<GetServerSidePropsResult<ItemLandingProps>> {
  const appConfig = await getAppConfig();

  let singleSlug: string | null = null;
  if (appConfig.openebooks) {
    singleSlug = appConfig.openebooks.defaultLibrary;
  } else {
    const libraries = await getLibraries(appConfig);
    const slugs = Object.keys(libraries).filter(s => libraries[s] != null);
    if (slugs.length === 1) singleSlug = slugs[0];
  }

  if (singleSlug) {
    try {
      const authDocUrl = await getAuthDocUrl(singleSlug, appConfig);
      const authDoc = await fetchAuthDocument(
        authDocUrl,
        appConfig.authenticationDocuments ?? undefined
      );
      const { catalogUrl } = buildLibraryData(authDoc, singleSlug);
      const bookUrl = buildWorkUrl(catalogUrl, workId);
      return {
        redirect: {
          destination: `/${singleSlug}/book/${encodeURIComponent(bookUrl)}`,
          permanent: false
        }
      };
    } catch {
      // Auth doc fetch failed; fall through to render the selector so the
      // user is not left with a blank page.
    }
  }

  return { props: { workId, appConfig } };
}

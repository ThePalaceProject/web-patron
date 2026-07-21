/**
 * GET /api/catalog-url?slug={slug}
 *
 * Returns the OPDS catalog root URL for a single library, resolved by fetching
 * its authentication document server-side. The auth document is cached in the
 * same in-process store used by withAppProps, so repeated calls for the same
 * library are cheap.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getAppConfig } from "server/appConfig";
import {
  getAuthDocUrl,
  fetchAuthDocument,
  buildLibraryData
} from "dataflow/getLibraryData";
import { PageNotFoundError } from "errors";

export interface CatalogUrlResponse {
  catalogUrl: string;
}

export interface CatalogUrlErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CatalogUrlResponse | CatalogUrlErrorResponse>
): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const { slug } = req.query;
  if (typeof slug !== "string" || !slug) {
    res.status(400).json({ error: "slug query parameter is required." });
    return;
  }

  try {
    const appConfig = await getAppConfig();
    const authDocUrl = await getAuthDocUrl(slug, appConfig);
    const authDoc = await fetchAuthDocument(
      authDocUrl,
      appConfig.authenticationDocuments ?? undefined
    );
    const { catalogUrl } = buildLibraryData(authDoc, slug);
    res.status(200).json({ catalogUrl });
  } catch (err) {
    if (err instanceof PageNotFoundError) {
      res.status(404).json({ error: `Library not found: ${slug}` });
      return;
    }
    console.error("GET /api/catalog-url failed:", err);
    res.status(500).json({ error: "Failed to resolve catalog URL." });
  }
}

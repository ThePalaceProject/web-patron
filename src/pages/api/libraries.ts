/**
 * GET /api/libraries
 *
 * Returns the current list of available libraries. For configs that specify
 * a `registries` array, libraries are fetched at runtime and cached
 * server-side. For configs with only static `libraries`, the runtime-loaded
 * list is returned directly.
 *
 * Only client-safe fields are included in the response; full registry
 * metadata remains server-side.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getLibraries } from "server/libraryRegistry";
import { getAppConfig } from "server/appConfig";

export interface ClientLibrary {
  id: string;
  slug: string;
  title: string;
  authDocUrl: string;
}

export interface LibrariesResponse {
  libraries: ClientLibrary[];
}

export interface LibrariesErrorResponse {
  error: string;
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<LibrariesResponse | LibrariesErrorResponse>
): Promise<void> {
  try {
    const appConfig = await getAppConfig();
    const libraries = await getLibraries(appConfig);

    const clientLibraries: ClientLibrary[] = Object.entries(libraries)
      .filter(
        (entry): entry is [string, NonNullable<(typeof entry)[1]>] =>
          entry[1] != null
      )
      .map(([slug, lib]) => ({
        id: lib.id ?? slug,
        slug,
        title: lib.title,
        authDocUrl: lib.authDocUrl
      }));

    res.status(200).json({ libraries: clientLibraries });
  } catch (err) {
    console.error("GET /api/libraries failed:", err);
    res.status(500).json({ error: "Failed to retrieve libraries." });
  }
}

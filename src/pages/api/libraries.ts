/**
 * GET /api/libraries
 *
 * Returns the current list of available libraries. For configs that specify
 * a `registries` array, libraries are fetched at runtime and cached
 * server-side. For configs with only static `libraries`, the build-time
 * list is returned directly.
 *
 * Only client-safe fields are included in the response; full registry
 * metadata remains server-side.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import type { AppConfig } from "interfaces";
import { getLibraries } from "server/libraryRegistry";

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
  const appConfigStr = process.env.APP_CONFIG;
  if (!appConfigStr) {
    res.status(500).json({ error: "APP_CONFIG is not configured." });
    return;
  }

  let appConfig: AppConfig;
  try {
    appConfig = JSON.parse(appConfigStr) as AppConfig;
  } catch {
    res.status(500).json({ error: "APP_CONFIG could not be parsed." });
    return;
  }

  try {
    const libraries = await getLibraries(appConfig);

    const clientLibraries: ClientLibrary[] = Object.entries(libraries)
      .filter(
        (entry): entry is [string, NonNullable<(typeof entry)[1]>] =>
          entry[1] != null
      )
      .map(([id, lib]) => ({
        id,
        slug: id,
        title: lib.title,
        authDocUrl: lib.authDocUrl
      }));

    res.status(200).json({ libraries: clientLibraries });
  } catch (err) {
    console.error("GET /api/libraries failed:", err);
    res.status(500).json({ error: "Failed to retrieve libraries." });
  }
}

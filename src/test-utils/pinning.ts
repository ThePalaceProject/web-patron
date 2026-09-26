import { OPDS1, PinnedLibrary } from "interfaces";
import { storeCredentials } from "auth/useCredentials";
import { writePinnedLibraries } from "utils/pinnedLibraries";

/** Stores the given libraries as pinned, in order. */
export function pinLibraries(
  ...libraries: Pick<PinnedLibrary, "id" | "slug" | "title">[]
): void {
  writePinnedLibraries(
    libraries.map(({ id, slug, title }) => ({
      id,
      slug,
      title,
      pinnedAt: 1000
    }))
  );
}

/** Stores credentials for the library slug, as if the user signed in. */
export function seedCredentials(slug: string): void {
  storeCredentials(slug, { token: "token", methodType: OPDS1.BasicAuthType });
}

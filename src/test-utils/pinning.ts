import { screen } from "@testing-library/react";
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

/** The My Libraries section, found through its heading. */
export function myLibrariesSection(): HTMLElement {
  const section = screen
    .getByRole("heading", { name: "My Libraries" })
    .closest("section");
  if (!section) throw new Error("My Libraries heading is not in a section");
  return section;
}

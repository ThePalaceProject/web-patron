import type { LibrariesResponse } from "pages/api/libraries";

export async function fetchLibraries(url: string): Promise<LibrariesResponse> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch libraries");
  return res.json();
}

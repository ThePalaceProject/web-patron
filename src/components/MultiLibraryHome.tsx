/* eslint-disable jsx-a11y/anchor-is-valid */
import { ThemeUIProvider } from "theme-ui";
import { Themed } from "@theme-ui/mdx";
import * as React from "react";
import useSWR from "swr";
import { APP_CONFIG } from "utils/env";
import theme from "theme/theme";
import LibraryHomeLink from "./LibraryHomeLink";
import type { ClientLibrary, LibrariesResponse } from "pages/api/libraries";

async function fetchLibraries(url: string): Promise<LibrariesResponse> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch libraries");
  return res.json();
}

const MultiLibraryHome: React.FC = () => {
  const { instanceName } = APP_CONFIG;
  const { data, error } = useSWR<LibrariesResponse>(
    "/api/libraries",
    fetchLibraries
  );

  if (!data || error) return null;

  const sorted = [...data.libraries].sort((a: ClientLibrary, b: ClientLibrary) => {
    const titleA = a.title || a.slug;
    const titleB = b.title || b.slug;
    return titleA.localeCompare(titleB);
  });

  if (sorted.length === 0) return null;

  return (
    <ThemeUIProvider theme={theme}>
      <Themed.root
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          m: 3
        }}
      >
        <h1>{instanceName} Home</h1>
        <h3>Choose a library:</h3>
        <ul>
          {sorted.map(lib => (
            <li key={lib.slug}>
              <LibraryHomeLink slug={lib.slug} title={lib.title} />
            </li>
          ))}
        </ul>
      </Themed.root>
    </ThemeUIProvider>
  );
};

export default MultiLibraryHome;

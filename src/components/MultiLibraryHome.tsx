/* eslint-disable jsx-a11y/anchor-is-valid */
import { ThemeUIProvider } from "theme-ui";
import { Themed } from "@theme-ui/mdx";
import * as React from "react";
import useSWR from "swr";
import { useAppConfig } from "components/context/AppConfigContext";
import theme from "theme/theme";
import LibraryHomeLink from "./LibraryHomeLink";
import LibraryFilterList from "components/LibraryFilterList";
import { fetchLibraries } from "dataflow/fetchLibraries";
import type { ClientLibrary, LibrariesResponse } from "pages/api/libraries";
import { useTranslation } from "next-i18next/pages";

const MultiLibraryHome: React.FC = () => {
  const { t } = useTranslation();
  const { instanceName } = useAppConfig();
  const { data, error } = useSWR<LibrariesResponse>(
    "/api/libraries",
    fetchLibraries
  );

  if (error)
    return (
      <p>
        {t(
          "multiLibraryHome.unableToLoad",
          "Unable to load static libraries from configuration file."
        )}
      </p>
    );
  if (!data) return null;
  if (!data.libraries?.length)
    return (
      <p>
        {t("library.noLibrariesAvailable", "No libraries available.", {
          ns: "common"
        })}
      </p>
    );

  const sorted = [...data.libraries].sort(
    (a: ClientLibrary, b: ClientLibrary) => {
      const titleA = a.title || a.slug;
      const titleB = b.title || b.slug;
      return titleA.localeCompare(titleB);
    }
  );

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
        <h1>
          {instanceName} {t("multiLibraryHome.home", "Home")}
        </h1>
        <LibraryFilterList
          heading={<h2>{t("multiLibraryHome.choose", "Choose a library:")}</h2>}
          items={sorted.map(lib => ({
            slug: lib.slug,
            label: lib.title || lib.slug
          }))}
          resultsListId="library-filter-results"
          renderItem={({ slug, highlighted }) => (
            <LibraryHomeLink slug={slug}>{highlighted}</LibraryHomeLink>
          )}
        />
      </Themed.root>
    </ThemeUIProvider>
  );
};

export default MultiLibraryHome;

/* eslint-disable jsx-a11y/anchor-is-valid */
import { ThemeUIProvider } from "theme-ui";
import { Themed } from "@theme-ui/mdx";
import * as React from "react";
import { APP_CONFIG } from "utils/env";
import theme from "theme/theme";
import LibraryHomeLink from "./LibraryHomeLink";

const MultiLibraryHome: React.FC = () => {
  const { libraries, instanceName } = APP_CONFIG;
  const slugs = Object.keys(libraries);

  if (!libraries || slugs.length === 0) return null;

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
          {slugs.map(slug => (
            <li key={slug}>
              <LibraryHomeLink slug={slug} title={libraries[slug]?.title} />
            </li>
          ))}
        </ul>
      </Themed.root>
    </ThemeUIProvider>
  );
};

export default MultiLibraryHome;

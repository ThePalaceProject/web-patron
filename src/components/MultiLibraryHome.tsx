/* eslint-disable jsx-a11y/anchor-is-valid */
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, ThemeUIProvider } from "theme-ui";
import { Themed } from "@theme-ui/mdx";
import * as React from "react";
import Link from "next/link";
import { APP_CONFIG } from "utils/env";
import theme from "theme/theme";

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
              <Link href={`/${slug}`}>/{libraries[slug]?.title}</Link>
            </li>
          ))}
        </ul>
      </Themed.root>
    </ThemeUIProvider>
  );
};

export default MultiLibraryHome;

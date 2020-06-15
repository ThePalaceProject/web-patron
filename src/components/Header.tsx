/** @jsx jsx */
import { jsx, Flex } from "theme-ui";
import * as React from "react";
import { NavigateContext } from "opds-web-client/lib/interfaces";
import { LibraryData } from "../interfaces";
import Search from "./Search";
import { NavButton, AnchorButton } from "./Button";
import Link from "./Link";
import BookIcon from "../icons/Book";
import useLibraryContext from "./context/LibraryContext";
import Stack from "./Stack";
import { Text } from "./Text";

export interface HeaderContext extends NavigateContext {
  library: LibraryData;
}

/**
 * will get the data it needs directly from context/
 * redux store instead of relying on OPDS web client to provide it
 */
const HeaderFC: React.FC<{ className?: string }> = ({ className }) => {
  const library = useLibraryContext();

  return (
    <>
      <header
        sx={{
          display: "flex",
          flexDirection: ["column", "column", "row"],
          alignItems: "stretch",
          px: 5
        }}
        className={className}
      >
        <Link
          href="/"
          aria-label="Library catalog, back to homepage"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start"
          }}
        >
          {library.logoUrl ? (
            <img src={library.logoUrl} alt={`${library.catalogName} Logo`} />
          ) : (
            <Text variant="text.headers.primary">{library.catalogName}</Text>
          )}
        </Link>
        <Flex
          sx={{
            flexDirection: "column",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flex: 1
          }}
        >
          <HeaderLinks library={library} />
          <Search />
        </Flex>
      </header>
    </>
  );
};

const HeaderLinks: React.FC<{ library: LibraryData }> = ({ library }) => {
  const { helpWebsite, libraryWebsite } = library.libraryLinks;
  const libraryName = library.catalogName;
  return (
    <Stack spacing={1} sx={{ m: 2, mr: 0 }}>
      {library?.headerLinks?.map(link => (
        <AnchorButton
          variant="ghost"
          color="ui.black"
          href={link.href}
          title={link.title}
          key={link.href}
        >
          {link.title}
        </AnchorButton>
      ))}
      {helpWebsite && (
        <AnchorButton
          variant="ghost"
          color="ui.black"
          href={helpWebsite.href}
          title="help"
        >
          Help
        </AnchorButton>
      )}
      {libraryWebsite && (
        <AnchorButton
          variant="ghost"
          color="ui.black"
          href={libraryWebsite.href}
          title="help"
        >
          {libraryWebsite.title ?? `${libraryName} Home`}
        </AnchorButton>
      )}
      <NavButton
        variant="ghost"
        color="ui.black"
        href="/loans"
        iconLeft={BookIcon}
      >
        My Books
      </NavButton>
      <NavButton href="/loans">Sign In</NavButton>
    </Stack>
  );
};

export default HeaderFC;

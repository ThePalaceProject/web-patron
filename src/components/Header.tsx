/** @jsx jsx */
import { jsx, Styled, Flex } from "theme-ui";
import * as React from "react";
import { NavigateContext } from "opds-web-client/lib/interfaces";
import { LibraryData } from "../interfaces";
import Search from "./Search";
import { NavButton, AnchorButton } from "./Button";
import Link from "./Link";
import BookIcon from "../icons/Book";
import useLibraryContext from "./context/LibraryContext";
import Stack from "./Stack";

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
    <header
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        px: 5
      }}
      className={className}
    >
      <Link
        sx={{
          display: "block",
          bg: "primary",
          color: "white",
          py: 2,
          textAlign: "center",
          padding: [2, 4]
        }}
        href="/"
      >
        <Styled.h2
          sx={{
            m: 0,
            mb: 1,
            fontSize: [2, 3]
          }}
        >
          {library.catalogName}
        </Styled.h2>
        <span
          sx={{
            fontSize: [0, 1],
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}
        >
          Library System
        </span>
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
      <NavButton href="/login">Sign In</NavButton>
    </Stack>
  );
};

export default HeaderFC;

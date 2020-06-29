/** @jsx jsx */
import { jsx, Flex } from "theme-ui";
import * as React from "react";
import { NavigateContext } from "opds-web-client/lib/interfaces";
import { LibraryData } from "../interfaces";
import Search from "./Search";
import Button, { NavButton, AnchorButton } from "./Button";
import Link from "./Link";
import BookIcon from "../icons/Book";
import useLibraryContext from "./context/LibraryContext";
import { Text } from "./Text";
import useAuth from "hooks/useAuth";

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
          px: [3, 5]
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
            alignItems: ["center", "flex-start"],
            textAlign: "center",
            p: 3
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
            alignItems: ["stretch", "flex-end"],
            justifyContent: "space-between",
            flex: 1
          }}
        >
          <HeaderLinks library={library} />
          <Search sx={{ minWidth: ["initial", 370], m: 3, mr: [3, 0] }} />
        </Flex>
      </header>
    </>
  );
};

const HeaderLinks: React.FC<{ library: LibraryData }> = ({ library }) => {
  const { helpWebsite, libraryWebsite } = library.libraryLinks;
  const libraryName = library.catalogName;
  const { signOutAndGoHome, isSignedIn } = useAuth();

  return (
    <div
      sx={{
        display: "flex",
        m: 2,
        mr: 0,
        flexWrap: "wrap",
        justifyContent: ["center", "flex-end"]
      }}
    >
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
        sx={{ mr: 1 }}
      >
        My Books
      </NavButton>
      {isSignedIn ? (
        <Button color="ui.black" onClick={signOutAndGoHome}>
          Sign Out
        </Button>
      ) : (
        <NavButton href="/loans">Sign In</NavButton>
      )}
    </div>
  );
};

export default HeaderFC;

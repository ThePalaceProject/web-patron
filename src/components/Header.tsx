import * as React from "react";
import { LibraryData } from "../interfaces";
import Search from "./Search";
import Button, { NavButton, AnchorButton } from "./Button";
import Link from "./Link";
import BookIcon from "../icons/Book";
import useLibraryContext from "./context/LibraryContext";
import { Text } from "./Text";
import Stack from "./Stack";
import { AccountMenu } from "./AccountMenu";
import useUser from "components/context/UserContext";
import useLogin from "auth/useLogin";
<<<<<<< HEAD
import ClientOnly from "./ClientOnly";
=======
import { useTranslation } from "next-i18next";
<<<<<<< HEAD
>>>>>>> b1d9ba13 (EKIRJASTO-771 Add example translation)
=======
import LanguageSelector from "components/LanguageSelector";
>>>>>>> 04a64e84 (EKIRJASTO-748 Show button group for language selection in app header)

const HeaderFC: React.FC<{ className?: string }> = ({ className }) => {
  const library = useLibraryContext();
  const { t } = useTranslation();

  return (
    <header
      sx={{
        display: "flex",
        flexDirection: ["column", "column", "row"],
        alignItems: "stretch",
        px: [3, 5],
        py: 3
      }}
      className={className}
    >
      {/* Temporary example string to test translations */}
      <Text>{t("hello")}</Text>
      <Link
        href="/"
        aria-label="Go to catalog home page"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: ["center", "flex-start"],
          textAlign: "center",
          p: 3,
          mb: [1, 0]
        }}
      >
        {library.logoUrl ? (
          <img src={library.logoUrl} alt={`${library.catalogName} Logo`} />
        ) : (
          <Text variant="text.headers.primary">{library.catalogName}</Text>
        )}
      </Link>
      <Stack
        direction="column"
        spacing={4}
        sx={{
          // flexDirection: "column",
          // flexWrap: "wrap",
          alignItems: ["stretch", "flex-end"],
          // justifyContent: "space-between",
          flex: 1
        }}
      >
        <HeaderLinks library={library} />
        <Search sx={{ minWidth: ["initial", 370], mr: [3, 0] }} />
      </Stack>
    </header>
  );
};

const HeaderLinks: React.FC<{ library: LibraryData }> = ({ library }) => {
  const { helpWebsite } = library.libraryLinks;
  const { isAuthenticated, isLoading } = useUser();
  const { baseLoginUrl } = useLogin();

  return (
    <div
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: ["center", "flex-end"]
      }}
    >
      <NavButton
        variant="ghost"
        color="ui.black"
        href="/"
        sx={{ whiteSpace: "initial" }}
      >
        Catalog
      </NavButton>

      <LanguageSelector />
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

      <NavButton
        variant="ghost"
        color="ui.black"
        href="/loans"
        iconLeft={BookIcon}
        sx={{ mr: 1 }}
      >
        My Books
      </NavButton>

      <ClientOnly>
        {isAuthenticated ? (
          <AccountMenu />
        ) : isLoading ? (
          <Button loading />
        ) : (
          <NavButton color="ui.black" href={baseLoginUrl}>
            Sign In
          </NavButton>
        )}
      </ClientOnly>
    </div>
  );
};

export default HeaderFC;

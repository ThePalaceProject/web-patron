/** @jsx jsx */
import { jsx, Styled, Flex } from "theme-ui";
import * as React from "react";
import { NavigateContext } from "opds-web-client/lib/interfaces";
import { LibraryData } from "../interfaces";
import LibraryContext from "./context/LibraryContext";
import RouterContext from "./context/RouterContext";
import Search from "./Search";
import { State } from "opds-web-client/lib/state";
import { usePathFor } from "opds-web-client/lib/components/context/PathForContext";
import { useActions } from "../components/context/ActionsContext";
import Button from "./Button";
import useCatalogLink from "../hooks/useCatalogLink";
import Link from "./Link";
import useTypedSelector from "../hooks/useTypedSelector";

import BookIcon from "../icons/Book";
import SettingsIcon from "../icons/Settings";
import useLibraryContext from "./context/LibraryContext";

export interface HeaderContext extends NavigateContext {
  library: LibraryData;
}

/**
 * will get the data it needs directly from context/
 * redux store instead of relying on OPDS web client to provide it
 */
const HeaderFC: React.FC<{ className?: string }> = ({ className }) => {
  const library = useLibraryContext();
  const loansUrl = useTypedSelector((state: State) => state?.loans?.url);
  const pathFor = usePathFor();
  const { actions, dispatch } = useActions();
  const router = React.useContext(RouterContext);

  // nav links
  const homeUrl = useCatalogLink(undefined);
  const myBooksUrl = useCatalogLink(undefined, loansUrl);
  const goMyBooks = () => router.push(myBooksUrl);
  // return <div>hi from header</div>;

  // sign in
  // const isSignedIn = useTypedSelector(
  //   (state: State) => state.auth //!!state?.auth?.credentials
  // );
  // const signIn = () => {
  //   if (actions.fetchLoans && loansUrl) {
  //     dispatch(actions.fetchLoans(loansUrl));
  //   }
  // };
  // const signOut = () => {
  //   dispatch(actions.clearAuthCredentials());
  //   router.push(pathFor(library.catalogUrl, null));
  // };

  return (
    <header
      sx={{
        display: "flex",
        flexDirection: ["column", "column", "row"],
        alignItems: ["stretch", "stretch", "flex-end"]
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
        to={homeUrl}
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
          flexDirection: ["column", "row"],
          flexWrap: "wrap",
          alignItems: ["center", "flex-end"],
          justifyContent: "space-between",
          flex: 1
        }}
      >
        <Flex
          sx={{ flexDirection: "row", justifyContent: "center", p: [2, 0] }}
        >
          <Button
            sx={{ m: 1, mb: [1, 0] }}
            variant="primary"
            onClick={goMyBooks}
          >
            <BookIcon sx={{ fontSize: 5 }} /> My Books
          </Button>
          <Button
            sx={{ m: 1, mb: [1, 0] }}
            variant="primary"
            // onClick={goSettings}
          >
            <SettingsIcon sx={{ fontSize: 5 }} /> Settings
          </Button>
          <Flex
            as="ol"
            sx={{ flexDirection: "row", alignItems: "center", p: 0, m: 1 }}
          >
            {library?.headerLinks?.map(link => (
              <li sx={{ listStyle: "none" }} key={link.href}>
                <a href={link.href} title={link.title}>
                  {link.title}
                </a>
              </li>
            ))}
          </Flex>
        </Flex>
        <Flex sx={{ justifyContent: "center", p: 2 }}>
          <Search />
        </Flex>
      </Flex>
    </header>
  );
};

export default HeaderFC;

// export default class Header extends React.Component<HeaderProps, {}> {
//   context: HeaderContext;

//   static contextTypes = {
//     library: PropTypes.object.isRequired,
//     router: PropTypes.object.isRequired,
//     pathFor: PropTypes.func.isRequired
//   };

//   constructor(props) {
//     super(props);
//     this.signIn = this.signIn.bind(this);
//     this.signOut = this.signOut.bind(this);
//   }

//   render(): JSX.Element {
//     return (
//       <NavBar>
//         <NavHeader>
//           <NavBrand className={this.context.library.logoUrl ? "with-logo" : ""}>
//             <NavBrandTitle>{this.context.library.catalogName}</NavBrandTitle>
//             <NavBrandSubtitle>Library System</NavBrandSubtitle>
//           </NavBrand>
//           <NavToggle />
//         </NavHeader>

//         <NavCollapse>
//           <NavList>
//             {this.context.library.headerLinks &&
//               this.context.library.headerLinks.map(link => (
//                 <li key={link.href}>
//                   <a href={link.href} title={link.title}>
//                     {link.title}
//                   </a>
//                 </li>
//               ))}
//             <li>
//               <CatalogLink
//                 collectionUrl={this.context.library.catalogUrl}
//                 bookUrl={null}
//               >
//                 Catalog
//               </CatalogLink>
//             </li>
//             {this.props.loansUrl && this.props.isSignedIn && (
//               <li>
//                 <CatalogLink collectionUrl={this.props.loansUrl} bookUrl={null}>
//                   My Books
//                 </CatalogLink>
//               </li>
//             )}
//             {this.props.loansUrl && this.props.isSignedIn && (
//               <li>
//                 <button onClick={this.signOut}>Sign Out</button>
//               </li>
//             )}
//             {this.props.loansUrl && !this.props.isSignedIn && (
//               <li>
//                 <button onClick={this.signIn}>Sign In</button>
//               </li>
//             )}
//           </NavList>

//           <Search />
//         </NavCollapse>
//       </NavBar>
//     );
//   }

//   signIn() {
//     if (this.props.fetchLoans && this.props.loansUrl) {
//       this.props.fetchLoans(this.props.loansUrl);
//     }
//   }

//   signOut() {
//     this.props.clearAuthCredentials();
//     this.context.router.push(
//       this.context.pathFor(this.context.library.catalogUrl, null)
//     );
//   }
// }

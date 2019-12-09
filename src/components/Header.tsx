/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { HeaderProps } from "opds-web-client/lib/components/Root";
import { NavigateContext } from "opds-web-client/lib/interfaces";
import { LibraryData } from "../interfaces";
import * as PropTypes from "prop-types";
import LibraryContext from "./context/LibraryContext";
import { useSelector } from "react-redux";
import RouterContext from "./context/RouterContext";

import {
  NavBar,
  NavHeader,
  NavBrand,
  NavBrandTitle,
  NavBrandSubtitle,
  NavToggle,
  NavCollapse,
  NavList
} from "./NavBar";
import { Search } from "./Search";
import { State } from "opds-web-client/lib/state";
import { PathForContext } from "opds-web-client/lib/components/context/PathForContext";
import useActions from "../hooks/useActions";

export interface HeaderContext extends NavigateContext {
  library: LibraryData;
}

/**
 * will get the data it needs directly from context/
 * redux store instead of relying on OPDS web client to provide it
 */
const HeaderFC: React.FC = () => {
  const library = React.useContext(LibraryContext);
  const loansUrl = useSelector((state: State) => state?.loans?.url);
  const isSignedIn = useSelector((state: State) => !!state?.auth?.credentials);
  const pathFor = React.useContext(PathForContext);
  const { actions, dispatch } = useActions();
  const router = React.useContext(RouterContext);

  const signIn = () => {
    if (actions.fetchLoans && loansUrl) {
      dispatch(actions.fetchLoans(loansUrl));
    }
  };

  const signOut = () => {
    dispatch(actions.clearAuthCredentials());
    router.push(pathFor(library.catalogUrl, null));
  };

  return (
    <nav>
      {/* <NavHeader>
        <NavBrand className={library.logoUrl ? "with-logo" : ""}>
          <NavBrandTitle>{library.catalogName}</NavBrandTitle>
          <NavBrandSubtitle>Library System</NavBrandSubtitle>
        </NavBrand>
        <NavToggle />
      </NavHeader> */}
      <div
        sx={{
          bg: "primary",
          color: "white",
          py: 3,
          textAlign: "center"
        }}
      >
        <h1
          sx={{
            m: 0,
            mb: 1,
            fontSize: 3
          }}
        >
          {library.catalogName}
        </h1>
        <div>Library System</div>
      </div>
      {/* <NavCollapse>
        <NavList>
          {library.headerLinks &&
            library.headerLinks.map(link => (
              <li key={link.href}>
                <a href={link.href} title={link.title}>
                  {link.title}
                </a>
              </li>
            ))}
          <li>
            <CatalogLink collectionUrl={library.catalogUrl} bookUrl={null}>
              Catalog
            </CatalogLink>
          </li>
          {loansUrl && isSignedIn && (
            <li>
              <CatalogLink collectionUrl={loansUrl} bookUrl={null}>
                My Books
              </CatalogLink>
            </li>
          )}
          {loansUrl && isSignedIn && (
            <li>
              <button onClick={signOut}>Sign Out</button>
            </li>
          )}
          {loansUrl && !isSignedIn && (
            <li>
              <button onClick={signIn}>Sign In</button>
            </li>
          )}
        </NavList>

        <Search />
      </NavCollapse> */}
    </nav>
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

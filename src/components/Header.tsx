import * as React from "react";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { HeaderProps } from "opds-web-client/lib/components/Root";
import { NavigateContext } from "opds-web-client/lib/interfaces";
import { LibraryData } from "../interfaces";
import * as PropTypes from "prop-types";

import { NavBar, NavHeader, NavBrand, NavBrandTitle, NavBrandSubtitle, NavToggle, NavCollapse, NavList } from "./NavBar"
import { Search } from "./Search"

export interface HeaderContext extends NavigateContext {
  library: LibraryData;
}

export default class Header extends React.Component<HeaderProps, {}> {
  context: HeaderContext;

  static contextTypes = {
    library: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  render(): JSX.Element {
    return (
      <NavBar>

        <NavHeader>
          <NavBrand className={this.context.library.logoUrl ? "with-logo" : ""}>
            <NavBrandTitle>{this.context.library.catalogName}</NavBrandTitle>
            <NavBrandSubtitle>Library System</NavBrandSubtitle>
          </NavBrand>
          <NavToggle />
        </NavHeader>

        <NavCollapse>

          <NavList>

            {this.context.library.headerLinks && this.context.library.headerLinks.map(link =>
              <li>
                <a href={link.href} title={link.title}>{link.title}</a>
              </li>
            )}
            <li>
              <CatalogLink
                collectionUrl={this.context.library.catalogUrl}
                bookUrl={null}>
                Catalog
              </CatalogLink>
            </li>
            {this.props.loansUrl && this.props.isSignedIn &&
              <li>
                <CatalogLink
                  collectionUrl={this.props.loansUrl}
                  bookUrl={null}>
                  My Books
                </CatalogLink>
              </li>
            }
            {this.props.loansUrl && this.props.isSignedIn &&
              <li>
                <a role="button" onClick={this.signOut}>Sign Out</a>
              </li>
            }
            {this.props.loansUrl && !this.props.isSignedIn &&
              <li>
                <a role="button" onClick={this.signIn}>Sign In</a>
              </li>
            }

          </NavList>

          <Search />

        </NavCollapse>

      </NavBar>
    );
  }

  signIn() {
    if (this.props.fetchLoans && this.props.loansUrl) {
      this.props.fetchLoans(this.props.loansUrl);
    }
  }

  signOut() {
    this.props.clearAuthCredentials();
    this.context.router.push(this.context.pathFor(this.context.library.catalogUrl, null));
  }
}